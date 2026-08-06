import { useRef } from 'react';
import {
  Card, Descriptions, Tag, Table, Button, Space, Typography, Divider,
  Alert, Row, Col, Statistic, Timeline,
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, FilePdfOutlined, PrinterOutlined,
  TeamOutlined, AppstoreOutlined, InboxOutlined, ToolOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useDiarioStore } from '../store';
import type { CondicaoClimatica, StatusAtividade } from '../types';
import dayjs from 'dayjs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const { Title, Text } = Typography;

const climaLabel: Record<CondicaoClimatica, string> = {
  ensolarado: '☀️ Ensolarado',
  parcialmente_nublado: '⛅ Parcialmente Nublado',
  nublado: '☁️ Nublado',
  chuva_leve: '🌦 Chuva Leve',
  chuva_forte: '⛈ Chuva Forte',
  outros: '🌪 Outros',
};

const statusLabel: Record<StatusAtividade, string> = {
  em_andamento: 'Em Andamento',
  concluida: 'Concluída',
  interrompida: 'Interrompida',
};

const statusColor: Record<StatusAtividade, string> = {
  em_andamento: 'processing',
  concluida: 'success',
  interrompida: 'error',
};

export default function DiarioView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getDiarioById } = useDiarioStore();
  const printRef = useRef<HTMLDivElement>(null);

  const diario = getDiarioById(id ?? '');

  if (!diario) {
    return (
      <Alert
        message="Diário não encontrado"
        type="error"
        showIcon
        action={<Button onClick={() => navigate('/diario')}>Voltar</Button>}
      />
    );
  }

  const handleExportPDF = async () => {
    if (!printRef.current) return;
    const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    let heightLeft = pdfHeight;
    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();
    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
    }
    pdf.save(`${diario.numeroRelatorio}.pdf`);
  };

  const equipeColumns = [
    { title: 'Nome', dataIndex: 'nome', key: 'nome' },
    { title: 'Função', dataIndex: 'funcao', key: 'funcao' },
    { title: 'Empresa', dataIndex: 'empresa', key: 'empresa' },
    { title: 'Entrada', dataIndex: 'horaEntrada', key: 'horaEntrada', width: 80 },
    { title: 'Saída', dataIndex: 'horaSaida', key: 'horaSaida', width: 80 },
    { title: 'Horas', dataIndex: 'horasTrabalhadas', key: 'horas', width: 70, render: (v: number) => `${v}h` },
  ];

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
        <div>
          <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate('/diario')}>Voltar</Button>
          <Title level={3} style={{ margin: 0 }}>Diário de Obra — {diario.numeroRelatorio}</Title>
        </div>
        <Space wrap>
          <Button icon={<EditOutlined />} onClick={() => navigate(`/diario/${id}/editar`)}>Editar</Button>
          <Button icon={<PrinterOutlined />} onClick={() => window.print()}>Imprimir</Button>
          <Button type="primary" icon={<FilePdfOutlined />} onClick={handleExportPDF}>Exportar PDF</Button>
        </Space>
      </div>

      <div ref={printRef}>
        {/* Cabeçalho do Relatório */}
        <Card
          bordered={false}
          style={{ borderRadius: 12, marginBottom: 16, background: 'linear-gradient(135deg, #1a56db 0%, #1a3db5 100%)' }}
        >
          <Row align="middle" justify="space-between">
            <Col>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, display: 'block' }}>RELATÓRIO DIÁRIO DE OBRA</Text>
              <Title level={2} style={{ color: '#fff', margin: '4px 0 0' }}>{diario.obra}</Title>
              <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                {dayjs(diario.data).format('dddd, DD [de] MMMM [de] YYYY')}
              </Text>
            </Col>
            <Col style={{ textAlign: 'right' }}>
              <Text code style={{ fontSize: 16, background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '4px 12px', borderRadius: 6 }}>
                {diario.numeroRelatorio}
              </Text>
              <br />
              <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 8, display: 'block' }}>
                Emitido em: {dayjs().format('DD/MM/YYYY HH:mm')}
              </Text>
            </Col>
          </Row>
        </Card>

        {/* KPIs */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={12} sm={6}>
            <Card bordered={false} style={{ borderRadius: 12, textAlign: 'center' }}>
              <Statistic title="Equipe" value={diario.equipe.length} suffix="pessoas" prefix={<TeamOutlined />} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} style={{ borderRadius: 12, textAlign: 'center' }}>
              <Statistic title="Atividades" value={diario.atividades.length} prefix={<AppstoreOutlined />} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} style={{ borderRadius: 12, textAlign: 'center' }}>
              <Statistic title="Materiais" value={diario.materiais.length} prefix={<InboxOutlined />} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} style={{ borderRadius: 12, textAlign: 'center' }}>
              <Statistic title="Equipamentos" value={diario.equipamentos.length} prefix={<ToolOutlined />} />
            </Card>
          </Col>
        </Row>

        {/* Informações Gerais */}
        <Card title="Informações Gerais" bordered={false} style={{ borderRadius: 12, marginBottom: 16 }}>
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered size="small">
            <Descriptions.Item label="Obra">{diario.obra}</Descriptions.Item>
            <Descriptions.Item label="Data">{dayjs(diario.data).format('DD/MM/YYYY')}</Descriptions.Item>
            <Descriptions.Item label="Responsável">{diario.responsavel}</Descriptions.Item>
            <Descriptions.Item label="Horário Início">{diario.horarioInicio}</Descriptions.Item>
            <Descriptions.Item label="Horário Encerramento">{diario.horarioEncerramento}</Descriptions.Item>
            <Descriptions.Item label="Condição Climática">
              {climaLabel[diario.condicaoClimatica]}
            </Descriptions.Item>
            {diario.observacoesClimaticas && (
              <Descriptions.Item label="Obs. Climáticas" span={3}>{diario.observacoesClimaticas}</Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Equipe */}
        {diario.equipe.length > 0 && (
          <Card title={<Space><TeamOutlined />Equipe Presente</Space>} bordered={false} style={{ borderRadius: 12, marginBottom: 16 }}>
            <Table
              dataSource={diario.equipe.map((e) => ({ ...e, key: e.id }))}
              columns={equipeColumns}
              size="small"
              pagination={false}
            />
          </Card>
        )}

        {/* Atividades */}
        {diario.atividades.length > 0 && (
          <Card title={<Space><AppstoreOutlined />Atividades Executadas</Space>} bordered={false} style={{ borderRadius: 12, marginBottom: 16 }}>
            <Timeline
              items={diario.atividades.map((a) => ({
                color: a.status === 'concluida' ? 'green' : a.status === 'em_andamento' ? 'blue' : 'red',
                children: (
                  <div>
                    <Space>
                      <Tag color={statusColor[a.status]}>{statusLabel[a.status]}</Tag>
                      <Text strong>{a.descricao}</Text>
                    </Space>
                    <br />
                    <Text type="secondary">
                      Local: {a.local} | Qtd: {a.quantidade} {a.unidade} | Equipe: {a.equipe}
                    </Text>
                    {a.observacoes && <><br /><Text type="secondary">Obs: {a.observacoes}</Text></>}
                  </div>
                ),
              }))}
            />
          </Card>
        )}

        {/* Materiais e Equipamentos */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          {diario.materiais.length > 0 && (
            <Col xs={24} md={12}>
              <Card title={<Space><InboxOutlined />Materiais Utilizados</Space>} bordered={false} style={{ borderRadius: 12 }}>
                <Table
                  dataSource={diario.materiais.map((m) => ({ ...m, key: m.id }))}
                  columns={[
                    { title: 'Material', dataIndex: 'material', key: 'material' },
                    { title: 'Qtd', dataIndex: 'quantidade', key: 'quantidade', width: 70 },
                    { title: 'Un.', dataIndex: 'unidade', key: 'unidade', width: 60 },
                    { title: 'Fornecedor', dataIndex: 'fornecedor', key: 'fornecedor' },
                  ]}
                  size="small"
                  pagination={false}
                />
              </Card>
            </Col>
          )}
          {diario.equipamentos.length > 0 && (
            <Col xs={24} md={12}>
              <Card title={<Space><ToolOutlined />Equipamentos</Space>} bordered={false} style={{ borderRadius: 12 }}>
                <Table
                  dataSource={diario.equipamentos.map((e) => ({ ...e, key: e.id }))}
                  columns={[
                    { title: 'Equipamento', dataIndex: 'equipamento', key: 'equipamento' },
                    { title: 'Operador', dataIndex: 'operador', key: 'operador' },
                    { title: 'Horas', dataIndex: 'horasUtilizacao', key: 'horas', width: 70, render: (v: number) => `${v}h` },
                    { title: 'Situação', dataIndex: 'situacao', key: 'situacao' },
                  ]}
                  size="small"
                  pagination={false}
                />
              </Card>
            </Col>
          )}
        </Row>

        {/* Ocorrências */}
        {diario.ocorrencias.length > 0 && (
          <Card
            title={<Space><WarningOutlined />Ocorrências do Dia</Space>}
            bordered={false}
            style={{ borderRadius: 12, marginBottom: 16 }}
          >
            {diario.ocorrencias.some((o) => o.origem === 'seguranca') && (
              <Alert
                message="Ocorrências de Segurança do Trabalho vinculadas"
                type="warning"
                showIcon
                style={{ marginBottom: 12 }}
              />
            )}
            {diario.ocorrencias.map((o) => (
              <div key={o.id} style={{ padding: '10px 16px', border: '1px solid #f0f0f0', borderRadius: 8, marginBottom: 8, borderLeft: `4px solid ${o.origem === 'seguranca' ? '#f5222d' : '#1a56db'}` }}>
                <Space>
                  <Tag color={o.origem === 'seguranca' ? 'red' : 'blue'}>{o.tipo}</Tag>
                  {o.origem === 'seguranca' && <Tag color="volcano">Segurança</Tag>}
                </Space>
                <br />
                <Text>{o.descricao}</Text>
              </div>
            ))}
          </Card>
        )}

        {/* Rodapé */}
        <Divider />
        <Card bordered={false} style={{ borderRadius: 12, background: '#fafafa' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Relatório gerado pelo sistema ObraSync<br />
                Data de emissão: {dayjs().format('DD/MM/YYYY [às] HH:mm')}<br />
                Número do relatório: {diario.numeroRelatorio}
              </Text>
            </Col>
            <Col style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '2px solid #333', width: 200, marginBottom: 4 }} />
              <Text>{diario.responsavel}</Text><br />
              <Text type="secondary" style={{ fontSize: 12 }}>Responsável Técnico</Text>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
}
