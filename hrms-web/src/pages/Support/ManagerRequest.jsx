// import React, { useState } from "react";
// import {
//   Form,
//   Input,
//   Button,
//   Select,
//   Card,
//   Spin,
//   Table,
//   Tag,
//   Space,
//   Modal,
//   Radio,
//   message,
//   Avatar,
//   Pagination,
// } from "antd";
// import dayjs from "dayjs";
// import debounce from "lodash/debounce";
// import {
//   UserAddOutlined,
//   EyeOutlined,
//   EditFilled,
//   UserOutlined,
// } from "@ant-design/icons";
// import { useMutation, useQuery } from "@tanstack/react-query";
// import axios from "../../axiosConfig";
// import { toast } from "react-hot-toast";
// import useAuthStore from "../../stores/authStore";
// import { useSearchParams } from "react-router-dom";

// const AdminSee = () => {
//  const [searchParssams] = useSearchParams();
 
//  const { user } = useAuthStore();
 
// const userId = searchParssams.get('user') ;

// if(userId){
//   user._id=userId
// }

//   const [actionForm] = Form.useForm();
//   const [selectedRequest, setSelectedRequest] = useState(null);
//   const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
//   const [isActionModalVisible, setIsActionModalVisible] = useState(false);
//   const [actionType, setActionType] = useState("feedback");
//   const [selectedEmployee, setSelectedEmployee] = useState(null);

//   // Fetch employee requests
//   const {
//     data: requests = [],
//     isLoading: isFetchingRequests,
//     isError: isFetchError,
//     error: fetchError,
//     refetch,
//   } = useQuery({
//     queryKey: ["employeeRequests"],
//     queryFn: async () => {
//       const response = await axios.get(
//         `/api/v1/support/employeeRequests/FromManager/${user._id}`
//       );
//       return response.data;
//     },
//     refetchOnWindowFocus: false,
//   });

//   const { mutate: updateRequest } = useMutation({
//     mutationFn: async (values) => {
//       const { _id, ...data } = values;
//       const response = await axios.patch(
//         `/api/v1/support/employeeRequests/${_id}`,
//         data
//       );
//       return response.data;
//     },
//     onSuccess: () => {
//       toast.success("Request updated successfully!");
//       actionForm.resetFields();
//       setIsActionModalVisible(false);
//       refetch();
//     },
//     onError: (error) => {
//       toast.error(error.response?.data?.message || "Failed to update request");
//     },
//   });

//   const showDetails = (request) => {
//     setSelectedRequest(request);
//     setIsDetailModalVisible(true);
//   };

//   const [employeeSearchParams, setEmployeeSearchParams] = useState({
//     search: "",
//     page: 1,
//     limit: 10,
//   });

//   const { data: employeesData, isLoading: employeesLoading } = useQuery({
//     queryKey: ["allEmployees", employeeSearchParams],
//     queryFn: async () => {
//       const response = await axios.get("/api/v1/user/staff", {
//         params: {
//           ...employeeSearchParams,
//         },
//       });
//       return response.data;
//     },
//     enabled: isActionModalVisible,
//   });

//   const handleEmployeeSearch = debounce((value) => {
//     setEmployeeSearchParams((prev) => ({
//       ...prev,
//       search: value,
//       page: 1,
//     }));
//   }, 500);

//   const handleAction = (request) => {
//     setSelectedRequest(request);
//     setIsActionModalVisible(true);
//     // Set initial status in form
//     actionForm.setFieldsValue({
//       status: request.status,
//     });
//   };

//   const handleActionSubmit = () => {
//     actionForm.validateFields().then((values) => {
//       const updateData = {
//         _id: selectedRequest._id,
//         updatedAt: new Date().toISOString(),
//         status: values.status,
//       };

//       if (actionType === "feedback") {
//         updateData.adminFeedback = values.feedback;
//       } else {
//         updateData.updatedBy = selectedEmployee._id;
//       }

//       updateRequest(updateData);
//     });
//   };

//   const getStatusTag = (status) => {
//     switch (status) {
//       case "approved":
//         return <Tag color="green">Approved</Tag>;
//       case "rejected":
//         return <Tag color="red">Rejected</Tag>;
//       case "fulfilled":
//         return <Tag color="blue">Fulfilled</Tag>;
//       default:
//         return <Tag color="orange">Pending</Tag>;
//     }
//   };

//   const columns = [
//     {
//       title: "Position",
//       dataIndex: "position",
//       key: "position",
//     },
//     {
//       title: "Department",
//       dataIndex: "department",
//       key: "department",
//     },
//     {
//       title: "Created At",
//       dataIndex: "createdAt",
//       key: "createdAt",
//       render: (text) => dayjs(text).format("DD/MM/YYYY hh:mm A"),
//     },
//     {
//       title: "Created By",
//       dataIndex: "managerId",
//       key: "managerId",
//       render: (text) => {
//         return text?.fullName || text?.firstName;
//       },
//     },
//     {
//       title: "Status",
//       dataIndex: "status",
//       key: "status",
//       render: (status) => getStatusTag(status),
//     },
//     {
//       title: "Urgency",
//       dataIndex: "urgency",
//       key: "urgency",
//       render: (urgency) => (
//         <Tag
//           color={
//             urgency === "high"
//               ? "red"
//               : urgency === "medium"
//               ? "orange"
//               : "green"
//           }
//         >
//           {urgency}
//         </Tag>
//       ),
//     },
//     {
//       title: "Action",
//       key: "action",
//       render: (_, record) => (
//         <div className="flex gap-2">
//           <Button icon={<EyeOutlined />} onClick={() => showDetails(record)}>
//             View
//           </Button>

//           {record.status !== "fulfilled" && (
//             <Button
//               type="primary"
//               icon={<EditFilled />}
//               onClick={() => handleAction(record)}
//             >
//               Action
//             </Button>
//           )}
//         </div>
//       ),
//     },
//   ];

//   if (isFetchError) {
//     return (
//       <Card title="Error" bordered={false}>
//         <p>Failed to load requests: {fetchError.message}</p>
//         <Button onClick={refetch}>Retry</Button>
//       </Card>
//     );
//   }

//   return (
//     <div className="space-y-6 h-[92vh] overflow-y-auto">
//       <Card
//         title={
//           <>
//             <UserAddOutlined /> Incoming Requests
//           </>
//         }
//         bordered={false}
//         className="shadow-md"
//         loading={isFetchingRequests}
//       >
//         {requests.length > 0 ? (
//           <Table
//             columns={columns}
//             dataSource={Array.isArray(requests) && requests}
//             rowKey="_id"
//             pagination={{ pageSize: 5 }}
//           />
//         ) : (
//           <p>No requests yet</p>
//         )}
//       </Card>

//       {/* Request Details Modal */}
//       <Modal
//         title="Request Details"
//         open={isDetailModalVisible}
//         onCancel={() => setIsDetailModalVisible(false)}
//         footer={null}
//         width={700}
//       >
//         {selectedRequest && (
//           <div className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <p className="font-semibold">Department:</p>
//                 <p>{selectedRequest.department}</p>
//               </div>
//               <div>
//                 <p className="font-semibold">Position:</p>
//                 <p>{selectedRequest.position}</p>
//               </div>
//               <div>
//                 <p className="font-semibold">Status:</p>
//                 <p>{getStatusTag(selectedRequest.status)}</p>
//               </div>
//               <div>
//                 <p className="font-semibold">Urgency:</p>
//                 <p>{selectedRequest.urgency}</p>
//               </div>
//             </div>

//                <div>
//                          <p className="font-semibold">Recuirement:</p>
//                          <div className="flex flex-wrap gap-2">
//                            {Array.isArray(selectedRequest?.countRequired) &&
//                              selectedRequest?.countRequired.map((skill) => (
//                                <Tag key={skill}>{skill}</Tag>
//                              ))}
//                          </div>
//                        </div>
           
//                        <div>
//                          <p className="font-semibold">Store:</p>
//                          <p>{selectedRequest?.store}</p>
//                        </div>

//             <div>
//               <p className="font-semibold">Job Description:</p>
//               <p className="whitespace-pre-line">
//                 {selectedRequest.jobDescription}
//               </p>
//             </div>

//             {selectedRequest.adminFeedback && (
//               <div>
//                 <p className="font-semibold">Admin Feedback:</p>
//                 <p>{selectedRequest.adminFeedback}</p>
//               </div>
//             )}

//             {selectedRequest.candidateDetails && (
//               <div className="mt-4 border-t pt-4">
//                 <h4 className="font-semibold text-lg">Candidate Details:</h4>
//                 <div className="grid grid-cols-2 gap-4 mt-2">
//                   <div>
//                     <p className="font-semibold">Name:</p>
//                     <p>{selectedRequest.candidateDetails.name}</p>
//                   </div>
//                   <div>
//                     <p className="font-semibold">Contact:</p>
//                     <p>{selectedRequest.candidateDetails.contact}</p>
//                   </div>
//                   {selectedRequest.candidateDetails.resumeUrl && (
//                     <div>
//                       <p className="font-semibold">Resume:</p>
//                       <a
//                         href={selectedRequest.candidateDetails.resumeUrl}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-blue-500"
//                       >
//                         View Resume
//                       </a>
//                     </div>
//                   )}
//                   {selectedRequest.candidateDetails.interviewDate && (
//                     <div>
//                       <p className="font-semibold">Interview Date:</p>
//                       <p>
//                         {new Date(
//                           selectedRequest.candidateDetails.interviewDate
//                         ).toLocaleString()}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </Modal>

//       {/* Action Modal */}
//       <Modal
//         title={`Take Action on Request`}
//         open={isActionModalVisible}
//         onCancel={() => {
//           setIsActionModalVisible(false);
//           actionForm.resetFields();
//         }}
//         footer={[
//           <Button key="back" onClick={() => setIsActionModalVisible(false)}>
//             Cancel
//           </Button>,
//           <Button key="submit" type="primary" onClick={handleActionSubmit}>
//             Submit
//           </Button>,
//         ]}
//         width={600}
//       >
//         <Form form={actionForm} layout="vertical">
//           <Form.Item
//             name="status"
//             label="Change Status"
//             rules={[{ required: true, message: "Please select a status" }]}
//           >
//             <Select>
//               <Select.Option value="pending">Pending</Select.Option>
//               <Select.Option value="approved">Approved</Select.Option>
//               <Select.Option value="rejected">Rejected</Select.Option>
//               <Select.Option value="fulfilled">Fulfilled</Select.Option>
//             </Select>
//           </Form.Item>

//           <Radio.Group
//             onChange={(e) => setActionType(e.target.value)}
//             value={actionType}
//             style={{ marginBottom: 20 }}
//           >
//             <Radio value="feedback">Provide Feedback</Radio>
//             <Radio value="assign">Assign to Someone</Radio>
//           </Radio.Group>

//           {actionType === "feedback" ? (
//             <Form.Item
//               name="feedback"
//               label="Feedback"
//               rules={[
//                 {
//                   required: actionType === "feedback",
//                   message: "Please provide feedback",
//                 },
//               ]}
//             >
//               <Input.TextArea rows={4} placeholder="Enter your feedback..." />
//             </Form.Item>
//           ) : (
//             <div className="mt-6">
//               <Select
//                 showSearch
//                 style={{ width: "100%" }}
//                 placeholder="Search employee by name or ID"
//                 optionFilterProp="children"
//                 filterOption={false}
//                 onSearch={handleEmployeeSearch}
//                 onChange={(value) => {
//                   const emp = employeesData?.data?.find((e) => e._id === value);
//                   setSelectedEmployee(emp);
//                 }}
//                 loading={employeesLoading}
//                 notFoundContent={
//                   employeesLoading ? <Spin size="small" /> : null
//                 }
//               >
//                 {Array.isArray(employeesData?.data) &&
//                   employeesData?.data?.map((employee) => (
//                     <Option key={employee._id} value={employee._id}>
//                       <div className="flex items-center">
//                         <Avatar
//                           size="small"
//                           src={employee.profilePicture}
//                           icon={<UserOutlined />}
//                           className="mr-2"
//                         />
//                         {employee.firstName} {employee.lastName} (
//                         {employee.EmployeeId || "N/A"})
//                       </div>
//                     </Option>
//                   ))}
//               </Select>

//               <div className="mt-4 flex justify-end">
//                 <Pagination
//                   size="small"
//                   current={employeeSearchParams.page}
//                   pageSize={employeeSearchParams.limit}
//                   total={employeesData?.totalCount}
//                   onChange={(page, pageSize) => {
//                     setEmployeeSearchParams((prev) => ({
//                       ...prev,
//                       page,
//                       limit: pageSize,
//                     }));
//                   }}
//                   showSizeChanger
//                   showQuickJumper
//                 />
//               </div>
//             </div>
//           )}
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default AdminSee;




import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Card,
  Spin,
  Table,
  Tag,
  Modal,
  Radio,
  Pagination,
  Row,
  Col,
  DatePicker,
  Statistic,
  Tabs,Space,
  Avatar,
  List,
  Divider
} from "antd";
import {
  BarChartOutlined,
  PieChartOutlined,
  UserOutlined,
  EyeOutlined,
  EditFilled,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserAddOutlined
} from "@ant-design/icons";
import { Pie, Bar } from "@ant-design/charts";
import dayjs from "dayjs";
import debounce from "lodash/debounce";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "../../axiosConfig";
import { toast } from "react-hot-toast";
import useAuthStore from "../../stores/authStore";
import { useSearchParams } from "react-router-dom";

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const AdminSee = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const userId = searchParams.get('user');

  if (userId) {
    user._id = userId;
  }

  const [actionForm] = Form.useForm();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState("feedback");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [filterParams, setFilterParams] = useState({
    page: 1,
    limit: 50,
    status: null,
    dateRange: null
  });

  // Fetch employee requests with filters
  const {
    data: requestsData = { data: [], total: 0, stats: {} },
    isLoading: isFetchingRequests,
    isError: isFetchError,
    error: fetchError,
    refetch,
  } = useQuery({
    queryKey: ["employeeRequests", filterParams],
    queryFn: async () => {
      const params = {
        ...filterParams,
        managerId: user._id,
        startDate: filterParams.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: filterParams.dateRange?.[1]?.format('YYYY-MM-DD')
      };
      
      const response = await axios.get(
        `/api/v1/support/employeeRequests/FromManager/${user._id}`,
        { params }
      );
      return response.data;
    },
    refetchOnWindowFocus: false,
  });

  const { mutate: updateRequest } = useMutation({
    mutationFn: async (values) => {
      const { _id, ...data } = values;
      const response = await axios.patch(
        `/api/v1/support/employeeRequests/${_id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Request updated successfully!");
      actionForm.resetFields();
      setIsActionModalVisible(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update request");
    },
  });

  const showDetails = (request) => {
    setSelectedRequest(request);
    setIsDetailModalVisible(true);
  };

  const [employeeSearchParams, setEmployeeSearchParams] = useState({
    search: "",
    page: 1,
    limit: 10,
  });

  const { data: employeesData, isLoading: employeesLoading } = useQuery({
    queryKey: ["allEmployees", employeeSearchParams],
    queryFn: async () => {
      const response = await axios.get("/api/v1/user/staff", {
        params: {
          ...employeeSearchParams,
        },
      });
      return response.data;
    },
    enabled: isActionModalVisible,
  });

  const handleEmployeeSearch = debounce((value) => {
    setEmployeeSearchParams((prev) => ({
      ...prev,
      search: value,
      page: 1,
    }));
  }, 500);

  const handleAction = (request) => {
    setSelectedRequest(request);
    setIsActionModalVisible(true);
    actionForm.setFieldsValue({
      status: request.status,
    });
  };

  const handleActionSubmit = () => {
    actionForm.validateFields().then((values) => {
      const updateData = {
        _id: selectedRequest._id,
        updatedAt: new Date().toISOString(),
        status: values.status,
      };

      if (actionType === "feedback") {
        updateData.adminFeedback = values.feedback;
      } else {
        updateData.updatedBy = selectedEmployee._id;
      }

      updateRequest(updateData);
    });
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      approved: { color: "green", icon: <CheckCircleOutlined /> },
      rejected: { color: "red", icon: <CloseCircleOutlined /> },
      fulfilled: { color: "blue", icon: <UserAddOutlined /> },
      pending: { color: "orange", icon: <ClockCircleOutlined /> }
    };

    return (
      <Tag color={statusConfig[status]?.color || "default"} icon={statusConfig[status]?.icon}>
        {status}
      </Tag>
    );
  };

  const columns = [
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
      sorter: (a, b) => a.position.localeCompare(b.position),
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      sorter: (a, b) => a.department.localeCompare(b.department),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => dayjs(text).format("DD/MM/YYYY hh:mm A"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Created By",
      dataIndex: "managerId",
      key: "managerId",
      render: (text) => text?.fullName || text?.firstName || "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
      filters: [
        { text: "Pending", value: "pending" },
        { text: "Approved", value: "approved" },
        { text: "Rejected", value: "rejected" },
        { text: "Fulfilled", value: "fulfilled" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Urgency",
      dataIndex: "urgency",
      key: "urgency",
      render: (urgency) => (
        <Tag
          color={
            urgency === "high"
              ? "red"
              : urgency === "medium"
              ? "orange"
              : "green"
          }
        >
          {urgency.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: "High", value: "high" },
        { text: "Medium", value: "medium" },
        { text: "Low", value: "low" },
      ],
      onFilter: (value, record) => record.urgency === value,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => showDetails(record)}
            className="text-blue-500"
          >
            View
          </Button>
          {record.status !== "fulfilled" && (
            <Button
              type="primary"
              icon={<EditFilled />}
              onClick={() => handleAction(record)}
            >
              Action
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Chart data preparation
  const statusChartData = [
    { type: 'Pending', value: requestsData.stats?.pending || 0 },
    { type: 'Approved', value: requestsData.stats?.approved || 0 },
    { type: 'Rejected', value: requestsData.stats?.rejected || 0 },
    { type: 'Fulfilled', value: requestsData.stats?.fulfilled || 0 },
  ];

  const urgencyChartData = [
    { type: 'High', value: requestsData.stats?.highUrgency || 0 },
    { type: 'Medium', value: requestsData.stats?.mediumUrgency || 0 },
    { type: 'Low', value: requestsData.stats?.lowUrgency || 0 },
  ];

  const statusChartConfig = {
    data: statusChartData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'inner',
      content: '{percentage}',
    },
    interactions: [{ type: 'element-active' }],
    color: ['#faad14', '#52c41a', '#f5222d', '#1890ff'],
  };

  const urgencyChartConfig = {
    data: urgencyChartData,
    xField: 'value',
    yField: 'type',
    seriesField: 'type',
    color: ['#f5222d', '#fa8c16', '#52c41a'],
    legend: { position: 'top-left' },
  };

  if (isFetchError) {
    return (
      <Card title="Error" bordered={false} className="shadow-lg">
        <div className="text-center py-8">
          <CloseCircleOutlined className="text-red-500 text-4xl mb-4" />
          <p className="text-lg">Failed to load requests: {fetchError.message}</p>
          <Button type="primary" onClick={refetch} className="mt-4">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="p-4 h-[92vh] overflow-y-auto">
      <Tabs defaultActiveKey="1" className="mb-6">
        <TabPane tab="Dashboard" key="1">
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Total Requests"
                  value={requestsData.total || 0}
                  prefix={<UserAddOutlined className="text-blue-500" />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Pending"
                  value={requestsData.stats?.pending || 0}
                  prefix={<ClockCircleOutlined className="text-orange-500" />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Approved"
                  value={requestsData.stats?.approved || 0}
                  prefix={<CheckCircleOutlined className="text-green-500" />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Rejected"
                  value={requestsData.stats?.rejected || 0}
                  prefix={<CloseCircleOutlined className="text-red-500" />}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} md={12}>
              <Card 
                title="Request Status Distribution" 
                bordered={false}
                className="shadow-md"
                extra={<PieChartOutlined />}
              >
                <Pie {...statusChartConfig} height={300} />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card 
                title="Urgency Level" 
                bordered={false}
                className="shadow-md"
                extra={<BarChartOutlined />}
              >
                <Bar {...urgencyChartConfig} height={300} />
              </Card>
            </Col>
          </Row>

          <Card 
            title="Recent Requests" 
            bordered={false}
            className="shadow-md"
            loading={isFetchingRequests}
          >
            <List
              itemLayout="horizontal"
              dataSource={requestsData.data?.slice(0, 5) || []}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button 
                      type="link" 
                      icon={<EyeOutlined />} 
                      onClick={() => showDetails(item)}
                    >
                      View
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={`${item.position} (${item.department})`}
                    description={
                      <>
                        <Tag color={item.urgency === 'high' ? 'red' : item.urgency === 'medium' ? 'orange' : 'green'}>
                          {item.urgency}
                        </Tag>
                        <span className="ml-2">
                          {dayjs(item.createdAt).format('DD/MM/YYYY')}
                        </span>
                      </>
                    }
                  />
                  {getStatusTag(item.status)}
                </List.Item>
              )}
            />
          </Card>
        </TabPane>

        <TabPane tab="All Requests" key="2">
          <Card
            title={
              <div className="flex justify-between items-center">
                <span>
                  <UserAddOutlined className="mr-2" />
                  Employee Requests
                </span>
                <RangePicker
                  onChange={(dates) => setFilterParams(prev => ({
                    ...prev,
                    dateRange: dates
                  }))}
                  value={filterParams.dateRange}
                />
              </div>
            }
            bordered={false}
            className="shadow-md"
            loading={isFetchingRequests}
          >
            <Table
              columns={columns}
              dataSource={requestsData.data || []}
              rowKey="_id"
              pagination={{
                current: filterParams.page,
                pageSize: filterParams.limit,
                total: requestsData.total,
                showSizeChanger: true,
                onChange: (page, pageSize) => {
                  setFilterParams(prev => ({
                    ...prev,
                    page,
                    limit: pageSize
                  }));
                },
              }}
              scroll={{ x: true }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* Request Details Modal */}
      <Modal
        title="Request Details"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={700}
        className="rounded-lg"
      >
        {selectedRequest && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <p className="font-semibold text-gray-600">Department</p>
                <p className="text-lg">{selectedRequest.department}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="font-semibold text-gray-600">Position</p>
                <p className="text-lg">{selectedRequest.position}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="font-semibold text-gray-600">Status</p>
                <div className="text-lg">
                  {getStatusTag(selectedRequest.status)}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="font-semibold text-gray-600">Urgency</p>
                <Tag 
                  color={
                    selectedRequest.urgency === 'high' ? 'red' : 
                    selectedRequest.urgency === 'medium' ? 'orange' : 'green'
                  }
                  className="text-lg"
                >
                  {selectedRequest.urgency.toUpperCase()}
                </Tag>
              </div>
            </div>

            <Divider orientation="left">Requirements</Divider>
            <div className="bg-gray-50 p-4 rounded">
              <p className="font-semibold text-gray-600">Required Positions</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {Array.isArray(selectedRequest?.countRequired) &&
                  selectedRequest?.countRequired.map((req, index) => (
                    <Tag key={index} color="blue">{req}</Tag>
                  ))}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <p className="font-semibold text-gray-600">Store/Headquarters</p>
              <p>{selectedRequest?.store || 'Not specified'}</p>
            </div>

            <Divider orientation="left">Job Description</Divider>
            <div className="bg-gray-50 p-4 rounded whitespace-pre-line">
              {selectedRequest.jobDescription}
            </div>

            {selectedRequest.adminFeedback && (
              <>
                <Divider orientation="left">Admin Feedback</Divider>
                <div className="bg-gray-50 p-4 rounded">
                  {selectedRequest.adminFeedback}
                </div>
              </>
            )}

            {selectedRequest.candidateDetails && (
              <>
                <Divider orientation="left">Candidate Details</Divider>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="font-semibold text-gray-600">Name</p>
                    <p>{selectedRequest.candidateDetails.name}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="font-semibold text-gray-600">Contact</p>
                    <p>{selectedRequest.candidateDetails.contact}</p>
                  </div>
                  {selectedRequest.candidateDetails.resumeUrl && (
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="font-semibold text-gray-600">Resume</p>
                      <a
                        href={selectedRequest.candidateDetails.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View Resume
                      </a>
                    </div>
                  )}
                  {selectedRequest.candidateDetails.interviewDate && (
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="font-semibold text-gray-600">Interview Date</p>
                      <p>
                        {dayjs(selectedRequest.candidateDetails.interviewDate).format('DD/MM/YYYY hh:mm A')}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal
        title={`Take Action on Request`}
        open={isActionModalVisible}
        onCancel={() => {
          setIsActionModalVisible(false);
          actionForm.resetFields();
        }}
        footer={[
          <Button key="back" onClick={() => setIsActionModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleActionSubmit}>
            Submit
          </Button>,
        ]}
        width={600}
        className="rounded-lg"
      >
        <Form form={actionForm} layout="vertical">
          <Form.Item
            name="status"
            label="Change Status"
            rules={[{ required: true, message: "Please select a status" }]}
          >
            <Select className="w-full">
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="approved">Approved</Select.Option>
              <Select.Option value="rejected">Rejected</Select.Option>
              <Select.Option value="fulfilled">Fulfilled</Select.Option>
            </Select>
          </Form.Item>

          <Radio.Group
            onChange={(e) => setActionType(e.target.value)}
            value={actionType}
            style={{ marginBottom: 20 }}
            className="w-full"
          >
            <Radio value="feedback">Provide Feedback</Radio>
            <Radio value="assign">Assign to Someone</Radio>
          </Radio.Group>

          {actionType === "feedback" ? (
            <Form.Item
              name="feedback"
              label="Feedback"
              rules={[
                {
                  required: actionType === "feedback",
                  message: "Please provide feedback",
                },
              ]}
            >
              <Input.TextArea rows={4} placeholder="Enter your feedback..." className="w-full" />
            </Form.Item>
          ) : (
            <div className="space-y-4">
              <Select
                showSearch
                placeholder="Search employee by name or ID"
                optionFilterProp="children"
                filterOption={false}
                onSearch={handleEmployeeSearch}
                onChange={(value) => {
                  const emp = employeesData?.data?.find((e) => e._id === value);
                  setSelectedEmployee(emp);
                }}
                loading={employeesLoading}
                notFoundContent={employeesLoading ? <Spin size="small" /> : null}
                className="w-full"
              >
                {Array.isArray(employeesData?.data) &&
                  employeesData?.data?.map((employee) => (
                    <Select.Option key={employee._id} value={employee._id}>
                      <div className="flex items-center">
                        <Avatar
                          size="small"
                          src={employee.profilePicture}
                          icon={<UserOutlined />}
                          className="mr-2"
                        />
                        {employee.firstName} {employee.lastName} (
                        {employee.EmployeeId || "N/A"})
                      </div>
                    </Select.Option>
                  ))}
              </Select>

              <div className="flex justify-end">
                <Pagination
                  size="small"
                  current={employeeSearchParams.page}
                  pageSize={employeeSearchParams.limit}
                  total={employeesData?.totalCount}
                  onChange={(page, pageSize) => {
                    setEmployeeSearchParams((prev) => ({
                      ...prev,
                      page,
                      limit: pageSize,
                    }));
                  }}
                  showSizeChanger
                  showQuickJumper
                />
              </div>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default AdminSee;
