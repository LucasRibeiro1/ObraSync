import { useState } from 'react';
import { Card, Table, Button, Space, Typography, Modal, Form, Input, Select, DatePicker, Row, Col, Statistic, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BuildOutlined } from '@ant-design/icons';
import { useObrasStore } from '../store';
import type { Obra } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function Obras() {
  const { obras, addObra, updateObra, removeObra } = useObrasStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Obra | null>(null);
  const [form] = Form.useForm();

  const openAdd = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (obra: Obra) => { setEditing(obra); form.setFieldsValue({ ...obra, dataInicio: dayjs(obra.dataInicio), previsaoTermino: dayjs(obra.previsaoTermino) }); setModalOpen(true); };

  const handleSave = () => {
    form.validateFields().then((values) => {
      const data = {
        ...values,
        dataInicio: values.dataInicio.format('YYYY-MM-DD'),
        previsaoTermino: values.previsaoTermino.format('YYYY-MM-DD'),
      };
      if (editing) {
        updateObra(editing.id, data);
      } else {
        addObra({ ...data, id: Date.now().toString() });
      }
      setModalOpen(false);
    });
  };

  const ativas = obras.filter((o) => o.status === 'ativa').length;
  const concluidas = obras.filter((o) => o.status === 'concluida').length;
  const paralisadas = obras.filter((o) => o.status === 'paralisada').length;

  const columns = [
    { title: 'Nome da Obra', dataIndex: 'nome', key: 'nome', ellipsis: true, render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Endereço', dataIndex: 'endereco', key: 'endereco', ellipsis: true },
    { title: 'Responsável', dataIndex: 'responsavel', key: 'responsavel' },
    { title: 'Início', dataIndex: 'dataInicio', key: 'dataInicio', render: (v: string) => dayjs(v).format('DD/MM/YYYY'), width: 110 },
    { title: 'Previsão Término', dataIndex: 'previsaoTermino', key: 'previsaoTermino', render: (v: string) => dayjs(v).format('DD/MM/YYYY'), width: 140 },
    {
      title: 'Status', dataIndex: 'status', key: 'status', width: 120,
      render: (v: string) => (
        <Badge
          status={v === 'ativa' ? 'processing' : v === 'concluida' ? 'success' : 'warning'}
          text={v === 'ativa' ? 'Ativa' : v === 'concluida' ? 'Concluída' : 'Paralisada'}
        />
      ),
    },
    {
      title: 'Ações', key: 'actions', width: 100,
      render: (_: unknown, r: Obra) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => Modal.confirm({
            title: 'Remover obra?', content: 'Essa ação não pode ser desfeita.',
            onOk: () => removeObra(r.id),
          })} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Gerenciamento de Obras</Title>
          <Text type="secondary">Cadastro e controle de obras ativas e concluídas</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>Nova Obra</Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, textAlign: 'center' }}>
            <Statistic title="Obras Ativas" value={ativas} prefix={<BuildOutlined style={{ color: '#1a56db' }} />} valueStyle={{ color: '#1a56db' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, textAlign: 'center' }}>
            <Statistic title="Concluídas" value={concluidas} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, textAlign: 'center' }}>
            <Statistic title="Paralisadas" value={paralisadas} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Table dataSource={obras.map((o) => ({ ...o, key: o.id }))} columns={columns} pagination={{ pageSize: 10 }} scroll={{ x: 800 }} />
      </Card>

      <Modal
        title={editing ? 'Editar Obra' : 'Nova Obra'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        width={640}
        style={{ maxWidth: '95vw' }}
        okText="Salvar"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="nome" label="Nome da Obra" rules={[{ required: true }]}>
            <Input placeholder="Ex: Residencial Vista Verde" />
          </Form.Item>
          <Form.Item name="endereco" label="Endereço" rules={[{ required: true }]}>
            <Input placeholder="Rua, número, cidade" />
          </Form.Item>
          <Form.Item name="responsavel" label="Responsável" rules={[{ required: true }]}>
            <Input placeholder="Nome do responsável" />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="dataInicio" label="Data de Início" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="previsaoTermino" label="Previsão de Término" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="ativa">Ativa</Select.Option>
              <Select.Option value="concluida">Concluída</Select.Option>
              <Select.Option value="paralisada">Paralisada</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
