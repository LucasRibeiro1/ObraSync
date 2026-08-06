import { useEffect } from 'react';
import { Card, Form, Input, Select, DatePicker, Button, Typography, Row, Col, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useSegurancaStore, useObrasStore } from '../store';
import type { AcaoPreventiva } from '../types';
import dayjs from 'dayjs';

const { Title } = Typography;
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

export default function AcaoForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { acoesPreventivas, addAcaoPreventiva, updateAcaoPreventiva } = useSegurancaStore();
  const { obras } = useObrasStore();
  const [form] = Form.useForm();

  useEffect(() => {
    if (isEdit && id) {
      const a = acoesPreventivas.find((x) => x.id === id);
      if (a) form.setFieldsValue({ ...a, data: dayjs(a.data) });
    }
  }, [id]);

  const handleSave = () => {
    form.validateFields().then((vals) => {
      const payload = {
        ...vals,
        data: vals.data.format('YYYY-MM-DD'),
        colaboradoresEnvolvidos: vals.colaboradoresEnvolvidos ?? [],
        anexos: [],
      };
      if (isEdit && id) {
        updateAcaoPreventiva(id, payload);
        message.success('Ação atualizada!');
      } else {
        addAcaoPreventiva({ id: uid(), criadoEm: new Date().toISOString(), ...payload } as AcaoPreventiva);
        message.success('Ação registrada!');
      }
      navigate('/seguranca');
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
        <div>
          <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate('/seguranca')}>Voltar</Button>
          <Title level={3} style={{ margin: 0 }}>{isEdit ? 'Editar' : 'Nova'} Ação Preventiva</Title>
        </div>
        <Button type="primary" icon={<SaveOutlined />} size="large" onClick={handleSave}>Salvar</Button>
      </div>
      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Form.Item name="data" label="Data" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} md={10}>
              <Form.Item name="obra" label="Obra" rules={[{ required: true }]}>
                <Select options={obras.map((o) => ({ value: o.nome, label: o.nome }))} showSearch />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="tipo" label="Tipo da Ação" rules={[{ required: true }]}>
                <Select options={[
                  { value: 'dds', label: 'DDS – Diálogo Diário de Segurança' },
                  { value: 'treinamento', label: 'Treinamento' },
                  { value: 'fiscalizacao', label: 'Fiscalização' },
                  { value: 'inspecao', label: 'Inspeção' },
                  { value: 'campanha', label: 'Campanha de Conscientização' },
                  { value: 'outro', label: 'Outro' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="descricao" label="Descrição da Ação" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="Descreva detalhadamente a ação preventiva realizada..." />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="responsavel" label="Responsável" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="colaboradoresEnvolvidos" label="Colaboradores Envolvidos">
                <Select mode="tags" placeholder="Adicione os nomes dos colaboradores" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}
