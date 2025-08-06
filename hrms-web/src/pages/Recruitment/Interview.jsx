// import { useState, useMemo, useCallback } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import {
//   Table,
//   Input,
//   Button,
//   Modal,
//   Form,
//   Popconfirm,
//   Tag,
//   Select,
// } from "antd";
// import { FiPlus, FiSearch, FiTrash2, FiEdit, FiSave } from "react-icons/fi";
// import { FaExclamationCircle } from "react-icons/fa";

// import toast from "react-hot-toast";
// import {
//   addInterviewRound,
//   deleteInterviewRound,
//   fetchInterviewRounds,
//   updateInterviewRound,
//   fetchInterviewersByrole,
// } from "../../api/interview";
// import { fetchRoles } from "../../api/auth";

// const InterviewRoundManagement = () => {
//   const [searchText, setSearchText] = useState("");
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [selectedDepartment, setSelectedDepartment] = useState(null);
//   const [form] = Form.useForm();
//   const queryClient = useQueryClient();

//   // Fetch interview rounds
//   const {
//     data: interviewRounds,
//     isLoading,
//     error,
//   } = useQuery({
//     queryKey: ["interviewRounds"],
//     queryFn: fetchInterviewRounds,
//     onError: (error) => toast.error(error.message),
//   });

//   // Fetch departments
//   const { data: departments } = useQuery({
//     queryKey: ["departments"],
//     queryFn: () => fetchRoles(),
//   });

//   // Fetch interviewers based on selected department
//   const { data: interviewers, isLoading: interviewersLoading } = useQuery({
//     queryKey: ["interviewers", selectedDepartment],
//     queryFn: () => fetchInterviewersByrole(selectedDepartment),
//     enabled: !!selectedDepartment,
//   });

//   // Memoized filtered interview rounds
//   const filteredInterviewRounds = useMemo(() => {
//     return  Array.isArray(interviewRounds) && interviewRounds?.filter(
//       (round) =>
//         round.name.toLowerCase().includes(searchText.toLowerCase()) ||
//         round.interviewer?.name.toLowerCase().includes(searchText.toLowerCase())
//     );
//   }, [interviewRounds, searchText]);

//   // Add interview round mutation
//   const addMutation = useMutation({
//     mutationFn: addInterviewRound,
//     onSuccess: (data) => {
//       queryClient.invalidateQueries(["interviewRounds"]);
//       toast.success(data.message || "Interview round added successfully");
//       setIsModalOpen(false);
//       form.resetFields();
//       setSelectedDepartment(null);
//     },
//     onError: (err) =>
//       toast.error(
//         err.response?.data?.message || "Error adding interview round"
//       ),
//   });

//   // Update interview round mutation
//   const updateMutation = useMutation({
//     mutationFn: updateInterviewRound,
//     onSuccess: (data) => {
//       queryClient.invalidateQueries(["interviewRounds"]);
//       toast.success(data.message || "Interview round updated successfully");
//       setEditingId(null);
//       form.resetFields();
//       setSelectedDepartment(null);
//     },
//     onError: (err) =>
//       toast.error(
//         err.response?.data?.message || "Error updating interview round"
//       ),
//   });

//   // Delete interview round mutation
//   const deleteMutation = useMutation({
//     mutationFn: deleteInterviewRound,
//     onSuccess: (data) => {
//       queryClient.invalidateQueries(["interviewRounds"]);
//       toast.success(data.message || "Interview round deleted successfully");
//     },
//     onError: (err) =>
//       toast.error(
//         err.response?.data?.message || "Error deleting interview round"
//       ),
//   });

//   // Handle department change
//   const handleDepartmentChange = useCallback(
//     (value) => {
//       setSelectedDepartment(value);
//       form.setFieldsValue({ interviewer: undefined }); 
//     },
//     [form]
//   );

//   // Memoized columns to prevent unnecessary re-renders
//   const columns = useMemo(
//     () => [
//       {
//         title: "Round No",
//         dataIndex: "roundNumber",
//         key: "roundNumber",
//         render: (text, record) =>
//           editingId === record._id ? (
//             <Form.Item
//               name="roundNumber"
//               initialValue={text}
//               rules={[{ required: true, message: "Round number is required" }]}
//             >
//               <Input type="number" />
//             </Form.Item>
//           ) : (
//             <Tag color="blue">{text}</Tag>
//           ),
//       },
//       {
//         title: "Round Name",
//         dataIndex: "name",
//         key: "name",
//         render: (text, record) =>
//           editingId === record._id ? (
//             <Form.Item
//               name="name"
//               initialValue={text}
//               rules={[{ required: true, message: "Round name is required" }]}
//             >
//               <Input />
//             </Form.Item>
//           ) : (
//             text
//           ),
//       },
//       {
//         title: "Interviewer",
//         dataIndex: ["interviewer", "firstName"],
//         key: "interviewer",
//         render: (text, record) =>
//           editingId === record._id ? (
//             <>
//               <Form.Item
//                 name="role"
//                 label="Role"
//                 initialValue={record.interviewer?.department?._id}
//                 rules={[{ required: true, message: "Role is required" }]}
//               >
//                 <Select
//                   placeholder="Select Role"
//                   onChange={handleDepartmentChange}
//                   options={  Array.isArray(departments) &&  departments?.map((d) => ({
//                     value: d._id,
//                     label: d.name,
//                   }))}
//                 />
//               </Form.Item>
//               <Form.Item
//                 name="interviewer"
//                 label="Interviewer"
//                 initialValue={record.interviewer?._id}
//                 rules={[{ required: true, message: "Interviewer is required" }]}
//               >
//                 <Select
//                   placeholder="Select interviewer"
//                   loading={interviewersLoading}
//                   options={interviewers?.map((i) => ({
//                     value: i._id,
//                     label: `${i.firstName} ${i.lastName || ""} (${i.email})`,
//                   }))}
//                 />
//               </Form.Item>
//             </>
//           ) : (
//             text
//           ),
//       },
//       {
//         title: "Description",
//         dataIndex: "description",
//         key: "description",
//         render: (text, record) =>
//           editingId === record._id ? (
//             <Form.Item name="description" initialValue={text}>
//               <Input.TextArea />
//             </Form.Item>
//           ) : (
//             text || "-"
//           ),
//       },
//       {
//         title: "Actions",
//         key: "actions",
//         render: (_, record) => (
//           <div className="flex gap-2">
//             {editingId === record._id ? (
//               <>
//                 <Button
//                   icon={<FiSave />}
//                   onClick={() => handleUpdate(record._id)}
//                   loading={updateMutation.isLoading}
//                 />
//                 <Button
//                   icon={<FiEdit />}
//                   onClick={handleEditCancel}
//                   disabled={updateMutation.isLoading}
//                 />
//               </>
//             ) : (
//               <>
//                 <Button
//                   icon={<FiEdit />}
//                   onClick={() => {
//                     setEditingId(record._id);
//                     const departmentId = record.interviewer?.department?._id;
//                     setSelectedDepartment(departmentId);

//                     setTimeout(() => {
//                       form.setFieldsValue({
//                         roundNumber: record.roundNumber,
//                         name: record.name,
//                         role: departmentId,
//                         interviewer: record.interviewer?._id,
//                         description: record.description,
//                       });
//                     }, 0);
//                   }}
//                   disabled={editingId !== null}
//                 />
//                 <Popconfirm
//                   title="Delete Interview Round"
//                   description="Are you sure?"
//                   icon={<FaExclamationCircle className="text-red-500" />}
//                   onConfirm={() => handleDelete(record._id)}
//                 >
//                   <Button
//                     icon={<FiTrash2 />}
//                     danger
//                     disabled={editingId !== null}
//                   />
//                 </Popconfirm>
//               </>
//             )}
//           </div>
//         ),
//       },
//     ],
//     [
//       editingId,
//       updateMutation.isLoading,
//       form,
//       departments,
//       interviewers,
//       interviewersLoading,
//       handleDepartmentChange,
//     ]
//   );

//   // Callbacks for handlers to maintain referential equality
//   const handleAdd = useCallback(() => {
//     form.validateFields().then((values) => {
//       addMutation.mutate(values);
//     });
//   }, [form, addMutation]);

//   const handleUpdate = useCallback(
//     (id) => {
//       form.validateFields().then((values) => {
//         updateMutation.mutate({ id, ...values });
//       });
//     },
//     [form, updateMutation]
//   );

//   const handleDelete = useCallback(
//     (id) => {
//       deleteMutation.mutate(id);
//     },
//     [deleteMutation]
//   );

//   const handleSearch = useCallback((e) => {
//     setSearchText(e.target.value);
//   }, []);

//   const handleModalOpen = useCallback(() => {
//     setIsModalOpen(true);
//   }, []);

//   const handleModalClose = useCallback(() => {
//     setIsModalOpen(false);
//     form.resetFields();
//     setSelectedDepartment(null);
//   }, [form]);

//   const handleEditCancel = useCallback(() => {
//     setEditingId(null);
//     form.resetFields();
//     setSelectedDepartment(null);
//   }, [form]);

//   return (
//     <div className="p-4">
//       <div className="flex justify-between mb-4">
//         <h1 className="text-xl font-bold">Interview Round Management</h1>
//         <Button type="primary" icon={<FiPlus />} onClick={handleModalOpen}>
//           Add Interview Round
//         </Button>
//       </div>

//       <Input
//         placeholder="Search interview rounds..."
//         prefix={<FiSearch />}
//         onChange={handleSearch}
//         className="mb-4"
//       />

//       <Form form={form} component={false}>
//         <Table
//           columns={columns}
//           dataSource={ Array.isArray(filteredInterviewRounds) &&  filteredInterviewRounds}
//           rowKey="_id"
//           loading={isLoading}
//           pagination={{ pageSize: 10 }}
//         />
//       </Form>

//       <Modal
//         title={editingId ? "Edit Interview Round" : "Add New Interview Round"}
//         open={isModalOpen}
//         onOk={handleAdd}
//         onCancel={handleModalClose}
//         confirmLoading={addMutation.isLoading}
//       >
//         <Form form={form} layout="vertical">
//           <Form.Item
//             name="roundNumber"
//             label="Round Number"
//             rules={[{ required: true }]}
//           >
//             <Input type="number" />
//           </Form.Item>
//           <Form.Item
//             name="name"
//             label="Round Name"
//             rules={[{ required: true }]}
//           >
//             <Input />
//           </Form.Item>
//           <Form.Item name="role" label="Role" rules={[{ required: true }]}>
//             <Select
//               placeholder="Select Role"
//               onChange={handleDepartmentChange}
//               options={
//                 Array.isArray(departments) &&
//                 departments?.map((d) => ({
//                   value: d._id,
//                   label: d.name,
//                 }))
//               }
//             />
//           </Form.Item>
//           <Form.Item
//             name="interviewer"
//             label="Interviewer"
//             rules={[{ required: true }]}
//           >
//             <Select
//               placeholder="Select interviewer"
//               disabled={!selectedDepartment}
//               loading={interviewersLoading}
//               options={interviewers?.map((i) => ({
//                 value: i._id,
//                 label: `${i.firstName} ${i.lastName || ""} (${i.email})`,
//               }))}
//             />
//           </Form.Item>
//           <Form.Item name="description" label="Description">
//             <Input.TextArea />
//           </Form.Item>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default InterviewRoundManagement;

import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  Popconfirm,
  Tag,
  Select,
  Space,
  Divider,
  Row,
  Col,
  InputNumber,
  Switch,
  Card,
  Collapse,
  Typography,
   
   
} from "antd";
import {
  FiPlus,
  FiSearch,
  FiTrash2,
  FiEdit,
  FiCopy
} from "react-icons/fi";
import { FaExclamationCircle, FaQuestionCircle } from "react-icons/fa";
import { v4 as uuidv4 } from 'uuid';

import {
  addInterviewRound,
  deleteInterviewRound,
  fetchInterviewRounds,
  updateInterviewRound,
  fetchInterviewersByrole,
  fetchInterviewRoundById
} from "../../api/interview";
import { fetchRoles } from "../../api/auth";
import toast from "react-hot-toast";

const { Panel } = Collapse;
const { Text } = Typography;

const QuestionFormItem = ({ name, form, remove, duplicate }) => {
  return (
    <Card
      size="small"
      title={`Question ${name + 1}`}
      extra={
        <Space>
          <Button
            type="text"
            icon={<FiCopy />}
            onClick={() => duplicate(name)}
          />
          <Button
            danger
            type="text"
            icon={<FiTrash2 />}
            onClick={() => remove(name)}
          />
        </Space>
      }
      style={{ marginBottom: 16 }}
    >
      <Form.Item
        name={[name, 'questionText']}
        label="Question Text"
        rules={[{ required: true, message: 'Question text is required' }]}
      >
        <Input.TextArea rows={3} placeholder="Enter the question" />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name={[name, 'expectedAnswer']}
            label="Expected Answer"
            rules={[{ required: true, message: 'Expected answer is required' }]}
          >
            <Select placeholder="Select expected answer">
              <Select.Option value={true}>True</Select.Option>
              <Select.Option value={false}>False</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name={[name, 'weightage']}
            label="Weightage"
            rules={[
              { required: true, message: 'Weightage is required' },
              { type: 'number', min: 1, max: 100, message: 'Weightage must be between 1-100' }
            ]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};

const InterviewRoundManagement = () => {
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [activeQuestionKeys, setActiveQuestionKeys] = useState([]);
  const [questionKeys, setQuestionKeys] = useState([]);
  const [form] = Form.useForm();


  // Fetch interview rounds
  const {
    data: interviewRounds,
    isLoading,
     refetch
  } = useQuery({
    queryKey: ["interviewRounds"],
    queryFn: fetchInterviewRounds,
   
  });

  // Fetch departments
  const { data: departments ,refetch:departRefact  } = useQuery({
    queryKey: ["departments"],
    queryFn: () => fetchRoles(),
    enabled:isModalOpen
  });

  // Fetch interviewers based on selected department
  const { data: interviewers, isLoading: interviewersLoading } = useQuery({
    queryKey: ["interviewers", selectedDepartment],
    queryFn: () => fetchInterviewersByrole(selectedDepartment),
    enabled: !!selectedDepartment,
  });

 


const { data: interviewRound, isLoading: isRoundLoading } = useQuery({
  queryKey: ["interviewRound", editingId],
  queryFn: () => fetchInterviewRoundById(editingId),
  enabled: !!editingId && isModalOpen,
  // Remove onSuccess from here - it belongs in mutations
});

// Then use useEffect to handle the data when it loads
useEffect(() => {
  if (interviewRound) {
    const initialKeys = interviewRound.questions?.map(() => uuidv4()) || [uuidv4()];
    setQuestionKeys(initialKeys);
    setActiveQuestionKeys(initialKeys.slice(0, 1));
    console.log(interviewRound)
    form.setFieldsValue({
      ...interviewRound,
      interviewer:interviewRound?.interviewer?._id,
      role: interviewRound?.interviewer?.Organization?.role._id
    });
    setSelectedDepartment(interviewRound?.interviewer?.Organization?.role?._id);
  }
}, [interviewRound, form]);











  // Memoized filtered interview rounds
  const filteredInterviewRounds = useMemo(() => {
    return interviewRounds?.filter(
      (round) =>
        round.name.toLowerCase().includes(searchText.toLowerCase()) ||
        round.interviewer?.name.toLowerCase().includes(searchText.toLowerCase())
    ) || [];
  }, [interviewRounds, searchText]);

  // Add interview round mutation
  const addMutation = useMutation({
    mutationFn: addInterviewRound,
    onSuccess: (data) => {
      refetch()
      toast.success(data.message || "Interview round added successfully");
      handleModalClose();
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.message || "Error adding interview round"
      ),
  });

  // Update interview round mutation
  const updateMutation = useMutation({
    mutationFn: updateInterviewRound,
    onSuccess: (data) => {
     refetch()
      toast.success(data.message || "Interview round updated successfully");
      handleModalClose();
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.message || "Error updating interview round"
      ),
  });

  // Delete interview round mutation
  const deleteMutation = useMutation({
    mutationFn: deleteInterviewRound,
    onSuccess: (data) => {
      refetch()
      toast.success(data.message || "Interview round deleted successfully");
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.message || "Error deleting interview round"
      ),
  });

  // Handle department change
  const handleDepartmentChange = useCallback(
    (value) => {
      setSelectedDepartment(value);
      form.setFieldsValue({ interviewer: undefined });
    },
    [form]
  );

  // Handle add question
  const handleAddQuestion = useCallback(() => {
    const newKey = uuidv4();
    setQuestionKeys(prev => [...prev, newKey]);
    setActiveQuestionKeys(prev => [...prev, newKey]);
    
    const questions = form.getFieldValue('questions') || [];
    form.setFieldsValue({
      questions: [...questions, {
        questionText: '',
        expectedAnswer: true,
        weightage: 10
      }]
    });
  }, [form]);

  // Handle duplicate question
  const handleDuplicateQuestion = useCallback((index) => {
    const questions = form.getFieldValue('questions') || [];
    if (index >= 0 && index < questions.length) {
      const newKey = uuidv4();
      const newQuestions = [...questions];
      newQuestions.splice(index + 1, 0, { ...questions[index] });
      
      setQuestionKeys(prev => {
        const newKeys = [...prev];
        newKeys.splice(index + 1, 0, newKey);
        return newKeys;
      });
      
      setActiveQuestionKeys(prev => [...prev, newKey]);
      form.setFieldsValue({ questions: newQuestions });
    }
  }, [form]);

  // Handle remove question
  const handleRemoveQuestion = useCallback((index) => {
    const questions = form.getFieldValue('questions') || [];
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      form.setFieldsValue({ questions: newQuestions });
      
      setQuestionKeys(prev => prev.filter((_, i) => i !== index));
      setActiveQuestionKeys(prev => prev.filter(key => key !== questionKeys[index]));
    } else {
      toast.error("At least one question is required");
    }
  }, [form, questionKeys]);

  // Handle question panel change
  const handleQuestionPanelChange = useCallback((keys) => {
    setActiveQuestionKeys(keys);
  }, []);

  // Handle form submit
  const handleFormSubmit = useCallback(() => {
    form.validateFields().then(values => {
      if (editingId) {
        updateMutation.mutate({ id: editingId, ...values });
      } else {
        addMutation.mutate(values);
      }
    });
  }, [form, editingId, addMutation, updateMutation]);

  // Handle delete
  const handleDelete = useCallback(
    (id) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  // Handle search
  const handleSearch = useCallback((e) => {
    setSearchText(e.target.value);
  }, []);

  // Handle modal open
  const handleModalOpen = useCallback(() => {
    setIsModalOpen(true);
    setEditingId(null);
    form.resetFields();
    setSelectedDepartment(null);
    
    // Initialize with one question
    const initialKey = uuidv4();
    setQuestionKeys([initialKey]);
    setActiveQuestionKeys([initialKey]);
    
    form.setFieldsValue({
      questions: [{
        questionText: '',
        expectedAnswer: true,
        weightage: 10
      }],
      passingScore: 70,
      duration: 30,
      isActive: true
    });
  }, [form]);

  // Handle edit
  const handleEdit = useCallback((id) => {
     
    setEditingId(id);
    setIsModalOpen(true);
  }, []);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    form.resetFields();
    setSelectedDepartment(null);
    setEditingId(null);
    setQuestionKeys([]);
    setActiveQuestionKeys([]);
  }, [form]);

  // Memoized columns
  const columns = useMemo(
    () => [
      {
        title: "Round No",
        dataIndex: "roundNumber",
        key: "roundNumber",
        sorter: (a, b) => a.roundNumber - b.roundNumber,
        render: (text) => <Tag color="blue">{text}</Tag>,
      },
      {
        title: "Round Name",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Interviewer",
        dataIndex: ["interviewer", "firstName"],
        key: "interviewer",
      },
      {
        title: "Questions",
        dataIndex: "questions",
        key: "questions",
        render: (questions) => questions?.length || 0,
      },
      {
        title: "Passing Score",
        dataIndex: "passingScore",
        key: "passingScore",
        render: (score) => `${score}%`,
      },
      {
        title: "Status",
        dataIndex: "isActive",
        key: "isActive",
        render: (isActive) => (
          <Tag color={isActive ? "green" : "red"}>
            {isActive ? "Active" : "Inactive"}
          </Tag>
        ),
      },
      {
        title: "Actions",
        key: "actions",
        render: (_, record) => (
          <Space size="small">
            <Button
              icon={<FiEdit />}
              onClick={() => handleEdit(record._id)}
            />
            <Popconfirm
              title="Delete Interview Round"
              description="Are you sure?"
              icon={<FaExclamationCircle style={{ color: 'red' }} />}
              onConfirm={() => handleDelete(record._id)}
            >
              <Button icon={<FiTrash2 />} danger />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [handleEdit, handleDelete]
  );

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-bold">Interview Round Management</h1>
        <Button type="primary" icon={<FiPlus />} onClick={handleModalOpen}>
          Add Interview Round
        </Button>
      </div>

      <Input
        placeholder="Search interview rounds..."
        prefix={<FiSearch />}
        onChange={handleSearch}
        className="mb-4"
      />

      <Table
        columns={columns}
        dataSource={filteredInterviewRounds}
        rowKey="_id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: true }}
      />

      <Modal
        title={editingId ? "Edit Interview Round" : "Add New Interview Round"}
        open={isModalOpen}
        onOk={handleFormSubmit}
        onCancel={handleModalClose}
        confirmLoading={addMutation.isLoading || updateMutation.isLoading}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="roundNumber"
                label="Round Number"
                rules={[{ required: true, message: 'Round number is required' }]}
              >
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Round Name"
                rules={[{ required: true, message: 'Round name is required' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Interviewer Role"
                rules={[{ required: true, message: 'Role is required' }]}
              >
                <Select
                  placeholder="Select Role"
                  onChange={handleDepartmentChange}
                  options={departments?.map((d) => ({
                    value: d._id,
                    label: d.name,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="interviewer"
                label="Interviewer"
                rules={[{ required: true, message: 'Interviewer is required' }]}
              >
                <Select
                  placeholder="Select interviewer"
                  disabled={!selectedDepartment}
                  loading={interviewersLoading}
                  options={interviewers?.map((i) => ({
                    value: i._id,
                    label: `${i.firstName} ${i.lastName || ""} (${i.email})`,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="passingScore"
                label="Passing Score (%)"
                rules={[
                  { required: true, message: 'Passing score is required' },
                  { type: 'number', min: 1, max: 100 }
                ]}
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="duration"
                label="Duration (minutes)"
                rules={[
                  { required: true, message: 'Duration is required' },
                  { type: 'number', min: 5 }
                ]}
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="isActive"
            label="Status"
            valuePropName="checked"
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <Divider orientation="left">
            <Space>
              <FaQuestionCircle />
              <Text strong>Questions</Text>
            </Space>
          </Divider>

          <Form.List name="questions">
            {(fields, { add, remove }) => (
              <>
                <Collapse 
                  activeKey={activeQuestionKeys}
                  onChange={handleQuestionPanelChange}
                  className="mb-4"
                >
                  {fields.map(({ key, name, ...restField }) => (
                    <Panel
                      key={questionKeys[name] || key}
                      header={`Question ${name + 1}`}
                      extra={
                        <Space>
                          <Button
                            type="text"
                            icon={<FiCopy />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateQuestion(name);
                            }}
                          />
                          <Button
                            type="text"
                            danger
                            icon={<FiTrash2 />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveQuestion(name);
                            }}
                          />
                        </Space>
                      }
                    >
                      <QuestionFormItem 
                        name={name}
                        form={form}
                        remove={() => handleRemoveQuestion(name)}
                        duplicate={() => handleDuplicateQuestion(name)}
                      />
                    </Panel>
                  ))}
                </Collapse>

                <Button
                  type="dashed"
                  onClick={() => {
                    handleAddQuestion();
                   
                  }}
                  block
                  icon={<FiPlus />}
                >
                  Add Question
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};

export default InterviewRoundManagement;