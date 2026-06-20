import { useEffect } from 'react';
import { Card, Form, Input, Select, DatePicker, Button, Typography, Row, Col, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useSegurancaStore, useObrasStore } from '../store';
import type { RelatoSeguranca } from '../types';
import dayjs from 'dayjs';

const { Title } = Typography;
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

export default function RelatoForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { relatos, addRelato, updateRelato } = useSegurancaStore();
  const { obras } = useObrasStore();
  const [form] = Form.useForm();

  useEffect(() => {
    if (isEdit && id) {
      const r = relatos.find((x) => x.id === id);
      if (r) form.setFieldsValue({ ...r, data: dayjs(r.data) });
    }
  }, [id]);

  const handleSave = () => {
    form.validateFields().then((vals) => {
      const payload = { ...vals, data: vals.data.format('YYYY-MM-DD'), anexos: [] };
      if (isEdit && id) {
        updateRelato(id, payload);
        message.success('Relato atualizado!');
      } else {
        addRelato({ id: uid(), criadoEm: new Date().toISOString(), ...payload } as RelatoSeguranca);
        message.success('Relato registrado!');
      }
      navigate('/seguranca');
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate('/seguranca')}>Voltar</Button>
          <Title level={3} style={{ margin: 0 }}>{isEdit ? 'Editar' : 'Novo'} Relato de Segurança</Title>
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
              <Form.Item name="funcionario" label="Funcionário" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="relato" label="Relato" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="Descreva a observação ou situação de segurança identificada..." />
          </Form.Item>
          <Form.Item name="recomendacoes" label="Recomendações" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="Quais ações ou recomendações você sugere?" />
          </Form.Item>
          <Form.Item name="observacoes" label="Observações Adicionais">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
