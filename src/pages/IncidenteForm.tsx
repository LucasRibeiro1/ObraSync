import { useEffect } from 'react';
import { Card, Form, Input, Select, DatePicker, Button, Typography, Row, Col, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useSegurancaStore, useObrasStore } from '../store';
import type { Incidente } from '../types';
import dayjs from 'dayjs';

const { Title } = Typography;
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

export default function IncidenteForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { incidentes, addIncidente, updateIncidente } = useSegurancaStore();
  const { obras } = useObrasStore();
  const [form] = Form.useForm();

  useEffect(() => {
    if (isEdit && id) {
      const i = incidentes.find((x) => x.id === id);
      if (i) form.setFieldsValue({ ...i, data: dayjs(i.data) });
    }
  }, [id]);

  const handleSave = () => {
    form.validateFields().then((vals) => {
      const payload = { ...vals, data: vals.data.format('YYYY-MM-DD'), anexos: [] };
      if (isEdit && id) {
        updateIncidente(id, payload);
        message.success('Incidente atualizado!');
      } else {
        addIncidente({ id: uid(), criadoEm: new Date().toISOString(), ...payload } as Incidente);
        message.success('Incidente registrado!');
      }
      navigate('/seguranca');
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate('/seguranca')}>Voltar</Button>
          <Title level={3} style={{ margin: 0 }}>{isEdit ? 'Editar' : 'Registrar'} Incidente</Title>
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
            <Col xs={24} md={12}>
              <Form.Item name="obra" label="Obra" rules={[{ required: true }]}>
                <Select options={obras.map((o) => ({ value: o.nome, label: o.nome }))} showSearch />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="local" label="Local" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="descricao" label="Descrição do Incidente" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="Descreva o que ocorreu..." />
          </Form.Item>
          <Form.Item name="riscosIdentificados" label="Possíveis Riscos Identificados" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="Quais riscos foram identificados a partir deste incidente?" />
          </Form.Item>
          <Form.Item name="acoesCorretivas" label="Ações Corretivas Realizadas" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="Quais ações foram tomadas para corrigir/prevenir?" />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
