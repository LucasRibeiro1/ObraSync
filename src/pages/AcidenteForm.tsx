import { useEffect } from 'react';
import {
  Card, Form, Input, Select, DatePicker, TimePicker, Button,
  Typography, Switch, InputNumber, Row, Col, message,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useSegurancaStore, useObrasStore } from '../store';
import type { AcidenteTrabalho } from '../types';
import dayjs from 'dayjs';

const { Title } = Typography;

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

export default function AcidenteForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { acidentes, addAcidente, updateAcidente } = useSegurancaStore();
  const { obras } = useObrasStore();
  const [form] = Form.useForm();

  useEffect(() => {
    if (isEdit && id) {
      const a = acidentes.find((x) => x.id === id);
      if (a) {
        form.setFieldsValue({
          ...a,
          data: dayjs(a.data),
          hora: dayjs(a.hora, 'HH:mm'),
        });
      }
    }
  }, [id]);

  const handleSave = () => {
    form.validateFields().then((vals) => {
      const payload = {
        ...vals,
        data: vals.data.format('YYYY-MM-DD'),
        hora: vals.hora.format('HH:mm'),
        anexos: [],
      };
      if (isEdit && id) {
        updateAcidente(id, payload);
        message.success('Acidente atualizado!');
      } else {
        addAcidente({ id: uid(), criadoEm: new Date().toISOString(), ...payload } as AcidenteTrabalho);
        message.success('Acidente registrado!');
      }
      navigate('/seguranca');
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate('/seguranca')}>Voltar</Button>
          <Title level={3} style={{ margin: 0 }}>{isEdit ? 'Editar' : 'Registrar'} Acidente de Trabalho</Title>
        </div>
        <Button type="primary" danger icon={<SaveOutlined />} size="large" onClick={handleSave}>Salvar Registro</Button>
      </div>

      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Form.Item name="data" label="Data" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="hora" label="Hora" rules={[{ required: true }]}>
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="obra" label="Obra" rules={[{ required: true }]}>
                <Select options={obras.map((o) => ({ value: o.nome, label: o.nome }))} showSearch />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="funcionario" label="Funcionário Envolvido" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="funcao" label="Função" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="local" label="Local do Acidente" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="descricao" label="Descrição Detalhada" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="Descreva detalhadamente como ocorreu o acidente..." />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="gravidade" label="Gravidade" rules={[{ required: true }]}>
                <Select options={[
                  { value: 'leve', label: '🟢 Leve' },
                  { value: 'moderada', label: '🟡 Moderada' },
                  { value: 'grave', label: '🔴 Grave' },
                ]} />
              </Form.Item>
            </Col>
            <Col xs={24} md={16}>
              <Form.Item name="atendimentoRealizado" label="Atendimento Realizado" rules={[{ required: true }]}>
                <Input placeholder="Descreva o atendimento prestado" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="encaminhamentoMedico" label="Encaminhamento Médico" valuePropName="checked">
                <Switch checkedChildren="Sim" unCheckedChildren="Não" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="necessidadeAfastamento" label="Necessidade de Afastamento" valuePropName="checked">
                <Switch checkedChildren="Sim" unCheckedChildren="Não" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="diasAfastados" label="Dias Afastados">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="responsavelRegistro" label="Responsável pelo Registro" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
