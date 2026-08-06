import { useState } from 'react';
import {
  Card, Button, Alert, Typography, Space, Table, Tag, Descriptions, Upload,
  Row, Col, Statistic, Divider, message,
} from 'antd';
import {
  ArrowLeftOutlined, InboxOutlined, CheckOutlined, CloseOutlined,
  FileTextOutlined, DollarOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useNotaFiscalStore } from '../store';
import type { NotaFiscal, ItemNotaFiscal } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Dragger } = Upload;

type ParsedNF = Omit<NotaFiscal, 'id' | 'importadoEm' | 'status'>;

function fmtCNPJ(v: string) {
  const d = v.replace(/\D/g, '');
  return d.length === 14 ? d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : v;
}

function fmtMoney(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ── Parser NF-e XML ────────────────────────────────────────────────────────────
function parseNFeXML(xmlString: string): ParsedNF | null {
  try {
    // Remove declarações de namespace para simplificar o parsing
    const cleaned = xmlString
      .replace(/\s+xmlns(?::\w+)?="[^"]*"/g, '')
      .replace(/<(\/?)\w+:(\w+)/g, '<$1$2');

    const parser = new DOMParser();
    const doc = parser.parseFromString(cleaned, 'text/xml');

    if (doc.querySelector('parsererror')) throw new Error('XML malformado');

    const infNFe = doc.querySelector('infNFe');
    if (!infNFe) throw new Error('Tag infNFe não encontrada — verifique se o arquivo é uma NF-e válida');

    function get(parent: Element | Document, tag: string): string {
      return parent.querySelector(tag)?.textContent?.trim() ?? '';
    }

    const ide = infNFe.querySelector('ide');
    const emit = infNFe.querySelector('emit');
    const dest = infNFe.querySelector('dest');
    const icmsTot = infNFe.querySelector('ICMSTot');

    // Dados da NF
    const numero = ide ? get(ide, 'nNF') : '';
    const serie = ide ? get(ide, 'serie') : '';
    const natOp = ide ? get(ide, 'natOp') : '';

    // Data: NF-e 4.00 usa dhEmi (datetime), versões antigas usam dEmi (date)
    const dhEmi = ide ? (get(ide, 'dhEmi') || get(ide, 'dEmi')) : '';
    const dataEmissao = dhEmi.slice(0, 10);

    // Fornecedor (emitente)
    const fornecedorCNPJ = emit ? (get(emit, 'CNPJ') || get(emit, 'CPF')) : '';
    const fornecedorNome = emit ? get(emit, 'xNome') : '';

    // Destinatário
    const destinatarioCNPJ = dest ? (get(dest, 'CNPJ') || get(dest, 'CPF')) : '';
    const destinatarioNome = dest ? get(dest, 'xNome') : '';

    // Chave de acesso (atributo Id da tag infNFe, sem o prefixo "NFe")
    const chaveAcesso = (infNFe.getAttribute('Id') ?? '').replace(/^NFe/, '');

    // Totais
    const valorTotal = parseFloat(icmsTot ? get(icmsTot, 'vNF') : '0') || 0;
    const valorProdutos = parseFloat(icmsTot ? get(icmsTot, 'vProd') : '0') || 0;

    if (!numero) throw new Error('Número da NF não encontrado');
    if (!fornecedorNome) throw new Error('Emitente não encontrado');

    // Itens
    const detNodes = infNFe.querySelectorAll('det');
    if (!detNodes.length) throw new Error('Nenhum item (det) encontrado na NF-e');

    const itens: ItemNotaFiscal[] = [];
    detNodes.forEach((det, index) => {
      const prod = det.querySelector('prod');
      if (!prod) return;
      const qtd = parseFloat(get(prod, 'qCom').replace(',', '.')) || 0;
      const vUnit = parseFloat(get(prod, 'vUnCom').replace(',', '.')) || 0;
      const vProd = parseFloat(get(prod, 'vProd').replace(',', '.')) || 0;
      itens.push({
        id: `${Date.now()}-${index}`,
        nItem: index + 1,
        codigo: get(prod, 'cProd'),
        descricao: get(prod, 'xProd'),
        ncm: get(prod, 'NCM') || undefined,
        cfop: get(prod, 'CFOP') || undefined,
        unidade: get(prod, 'uCom'),
        quantidade: qtd,
        valorUnitario: vUnit,
        valorTotal: vProd,
      });
    });

    return {
      numero,
      serie,
      chaveAcesso: chaveAcesso || undefined,
      dataEmissao,
      naturezaOperacao: natOp || undefined,
      fornecedorCNPJ,
      fornecedorNome,
      destinatarioCNPJ: destinatarioCNPJ || undefined,
      destinatarioNome: destinatarioNome || undefined,
      valorProdutos,
      valorTotal,
      itens,
    };
  } catch (err) {
    return null;
  }
}

export default function NotaFiscalImport() {
  const navigate = useNavigate();
  const { addNotaFiscal } = useNotaFiscalStore();
  const [parsedNF, setParsedNF] = useState<ParsedNF | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [importing, setImporting] = useState(false);

  function handleFile(file: File) {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const xml = e.target?.result as string;
      const parsed = parseNFeXML(xml);
      if (parsed) {
        setParsedNF(parsed);
        setParseError(null);
      } else {
        setParsedNF(null);
        setParseError(
          'Não foi possível ler este arquivo. Verifique se é um XML de NF-e válido (modelo 55 ou 65, versões 3.10 ou 4.00).'
        );
      }
    };
    reader.onerror = () => setParseError('Erro ao ler o arquivo.');
    reader.readAsText(file, 'UTF-8');
    return false;
  }

  function handleImport() {
    if (!parsedNF) return;
    setImporting(true);
    const id = `nf-${Date.now()}`;
    const nf: NotaFiscal = {
      id,
      ...parsedNF,
      status: 'importada',
      importadoEm: new Date().toISOString(),
    };
    setTimeout(() => {
      addNotaFiscal(nf);
      message.success(`NF-e ${nf.numero} importada com sucesso!`);
      navigate(`/notas/${id}`);
    }, 500);
  }

  function handleClear() {
    setParsedNF(null);
    setParseError(null);
    setFileName('');
  }

  const itemColumns = [
    { title: '#', dataIndex: 'nItem', key: 'n', width: 45 },
    { title: 'Código', dataIndex: 'codigo', key: 'cod', width: 100, responsive: ['md'] as ('md')[] },
    { title: 'Descrição', dataIndex: 'descricao', key: 'desc', ellipsis: true },
    { title: 'NCM', dataIndex: 'ncm', key: 'ncm', width: 90, responsive: ['lg'] as ('lg')[] },
    { title: 'CFOP', dataIndex: 'cfop', key: 'cfop', width: 70, responsive: ['lg'] as ('lg')[] },
    { title: 'Un.', dataIndex: 'unidade', key: 'un', width: 60 },
    { title: 'Qtd.', dataIndex: 'quantidade', key: 'qtd', width: 80, render: (v: number) => v.toLocaleString('pt-BR') },
    { title: 'V. Unit.', dataIndex: 'valorUnitario', key: 'vunit', width: 100, responsive: ['sm'] as ('sm')[], render: (v: number) => fmtMoney(v) },
    { title: 'V. Total', dataIndex: 'valorTotal', key: 'vtot', width: 110, render: (v: number) => <Text strong>{fmtMoney(v)}</Text> },
  ];

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate('/notas')} />
        <div>
          <Title level={3} style={{ margin: 0 }}>Importar XML de NF-e</Title>
          <Text type="secondary">Carregue o arquivo XML da Nota Fiscal Eletrônica (modelo 55 ou 65)</Text>
        </div>
      </div>

      {!parsedNF && !parseError && (
        <Card bordered={false} style={{ borderRadius: 12, marginBottom: 24 }}>
          <Dragger
            accept=".xml"
            beforeUpload={(file) => { handleFile(file); return false; }}
            showUploadList={false}
            style={{ padding: '32px 0' }}
          >
            <p style={{ fontSize: 48, color: '#1a56db', marginBottom: 16 }}>
              <InboxOutlined />
            </p>
            <p style={{ fontSize: 16, fontWeight: 600 }}>Arraste o XML da NF-e aqui</p>
            <p style={{ color: '#8c8c8c' }}>ou clique para selecionar o arquivo</p>
            <p style={{ color: '#bfbfbf', fontSize: 12, marginTop: 12 }}>
              Suporte: NF-e modelo 55 e NFC-e modelo 65 · Versões 3.10 e 4.00
            </p>
          </Dragger>

          <Divider />

          <div style={{ background: '#f5f5f5', borderRadius: 8, padding: 16 }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>Como obter o XML da NF-e:</Text>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#595959', lineHeight: 2 }}>
              <li>Acesse o portal SEFAZ do estado do emitente</li>
              <li>Ou solicite o arquivo XML diretamente ao fornecedor</li>
              <li>Sistemas ERP exportam o XML pelo número da chave de acesso</li>
              <li>O arquivo deve ter extensão <code>.xml</code> e estar codificado em UTF-8</li>
            </ul>
          </div>
        </Card>
      )}

      {parseError && (
        <Alert
          type="error"
          showIcon
          message="Falha ao interpretar o XML"
          description={parseError}
          style={{ marginBottom: 24 }}
          action={
            <Button size="small" icon={<CloseOutlined />} onClick={handleClear}>
              Tentar outro arquivo
            </Button>
          }
        />
      )}

      {parsedNF && (
        <>
          {/* Resumo da NF */}
          <Card
            bordered={false}
            style={{ borderRadius: 12, marginBottom: 16 }}
            title={
              <Space>
                <FileTextOutlined style={{ color: '#1a56db' }} />
                <span>NF-e {parsedNF.numero} — Série {parsedNF.serie}</span>
                <Tag color="success"><CheckOutlined /> Lida com sucesso</Tag>
              </Space>
            }
            extra={
              <Space wrap>
                <Button icon={<CloseOutlined />} onClick={handleClear}>Outro arquivo</Button>
                <Button type="primary" icon={<CheckOutlined />} loading={importing} onClick={handleImport}>
                  Importar Nota
                </Button>
              </Space>
            }
          >
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={12} sm={6}>
                <Statistic title="Valor Total" value={parsedNF.valorTotal} prefix="R$" formatter={(v) => Number(v).toLocaleString('pt-BR')} valueStyle={{ color: '#1a56db' }} />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic title="Itens" value={parsedNF.itens.length} />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic title="Data de Emissão" value={parsedNF.dataEmissao ? dayjs(parsedNF.dataEmissao).format('DD/MM/YYYY') : '—'} valueStyle={{ fontSize: 16 }} />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic title="Arquivo" value={fileName} valueStyle={{ fontSize: 12 }} />
              </Col>
            </Row>

            <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="Emitente (Fornecedor)">{parsedNF.fornecedorNome}</Descriptions.Item>
              <Descriptions.Item label="CNPJ Emitente">{fmtCNPJ(parsedNF.fornecedorCNPJ)}</Descriptions.Item>
              {parsedNF.destinatarioNome && <Descriptions.Item label="Destinatário">{parsedNF.destinatarioNome}</Descriptions.Item>}
              {parsedNF.destinatarioCNPJ && <Descriptions.Item label="CNPJ Destinatário">{fmtCNPJ(parsedNF.destinatarioCNPJ)}</Descriptions.Item>}
              {parsedNF.naturezaOperacao && <Descriptions.Item label="Natureza da Operação" span={2}>{parsedNF.naturezaOperacao}</Descriptions.Item>}
              {parsedNF.chaveAcesso && (
                <Descriptions.Item label="Chave de Acesso" span={2}>
                  <Text style={{ fontSize: 11, fontFamily: 'monospace', wordBreak: 'break-all' }}>{parsedNF.chaveAcesso}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Itens da NF */}
          <Card
            bordered={false}
            style={{ borderRadius: 12 }}
            title={`Itens da Nota (${parsedNF.itens.length})`}
            extra={<Space><DollarOutlined /><Text strong>Total: {fmtMoney(parsedNF.valorTotal)}</Text></Space>}
          >
            <Table
              dataSource={parsedNF.itens.map((i) => ({ ...i, key: i.id }))}
              columns={itemColumns}
              pagination={false}
              size="small"
              scroll={{ x: 700 }}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={7}>
                    <Text strong>Total</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <Text strong>{fmtMoney(parsedNF.valorTotal)}</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button icon={<CloseOutlined />} onClick={handleClear}>Cancelar</Button>
              <Button type="primary" size="large" icon={<CheckOutlined />} loading={importing} onClick={handleImport}>
                Importar NF-e e vincular itens
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
