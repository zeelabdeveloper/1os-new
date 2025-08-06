// import React, { useEffect, useState } from "react";
// import { Card, Switch, Divider, Form, Button, Row, Col, Spin, Input } from "antd";
// import {
//   TeamOutlined,
//   FileDoneOutlined,
//   DollarOutlined,
//   UserAddOutlined,
//   LaptopOutlined,
//   FileOutlined,
//   SettingOutlined,
//   MailOutlined,
//   SearchOutlined
// } from "@ant-design/icons";
// import { useQuery, useMutation } from "@tanstack/react-query";
 
// import toast from "react-hot-toast";
// import { debounce } from "lodash";
// import axios from "../axiosConfig";




// export const fetchUserPermissions = async (userId) => {
//   const response = await axios.get(`/api/v1/permission/users/${userId}/permissions`);
//   return response.data;
// };

// export const updateUserPermissions = async ({ userId, permissions }) => {
//   const response = await axios.put(`/api/v1/permission/users/${userId}/permissions`, { permissions });
//   return response.data;
// };










// const UserPermissionManagement = () => {
//   const [form] = Form.useForm();
//   const [searchForm] = Form.useForm();
 
//   const [selectedUserId, setSelectedUserId] = useState(null);
//   const [searchParams, setSearchParams] = useState({
//     search: "",
//     page: 1,
//     limit: 10,
//   });

//   // Search users with debounce
//   const { data: usersData, isLoading: isSearching } = useQuery({
//     queryKey: ["users", searchParams],
//     queryFn:     async () => {
      
//       const response = await axios.get("/api/v1/user/staff", {
//         params: {
//           ...searchParams,
//         },
//       });
//       return response.data;
//     },          
//   });

//   // Fetch permissions for selected user
//   const { data: userPermissions,refetch,   isLoading } = useQuery({
//     queryKey: ["userPermissions", selectedUserId],
//     queryFn: () => fetchUserPermissions(selectedUserId),
//     enabled: !!selectedUserId,
//   });

//   const updateMutation = useMutation({
//     mutationFn: updateUserPermissions,
//     onSuccess: () => {
//       toast.success("Permissions updated successfully");
//      refetch()
//     },
//     onError: (error) => {
//       toast.error(error.response?.data?.message || "Failed to update permissions");
//     },
//   });

//   // Debounced search
//   const handleSearch = debounce((values) => {
//     setSearchParams(prev => ({
//       ...prev,
//       search: values.search,
//       page: 1
//     }));
//   }, 500);

//   useEffect(() => {
//     if (userPermissions) {
//       form.setFieldsValue(userPermissions);
//     }
//   }, [userPermissions, form]);

//   const handleSubmit = async () => {
//     try {
//       const values = await form.validateFields();
//       await updateMutation.mutateAsync({
//         userId: selectedUserId,
//         permissions: values
//       });
//     } catch (err) {
//       console.error("Error saving permissions:", err);
//     }
//   };

//   const permissionGroups = [
//     {
//       title: "Employee Management",
//       icon: <TeamOutlined />,
//       color: "#1890ff",
//       items: [
//         { name: "permissions.employee.view", label: "View Employees" },
//         { name: "permissions.employee.create", label: "Create Employees" },
//         { name: "permissions.employee.edit", label: "Edit Employees" },
//         { name: "permissions.employee.delete", label: "Delete Employees" },
//         { name: "permissions.employee.export", label: "Export Data" },
//       ],
//     },
//     {
//       title: "Leave Management",
//       icon: <FileDoneOutlined />,
//       color: "#13c2c2",
//       items: [
//         { name: "permissions.leave.view", label: "View Leaves" },
//         { name: "permissions.leave.approve", label: "Approve Leaves" },
//         { name: "permissions.leave.reject", label: "Reject Leaves" },
//         { name: "permissions.leave.manage", label: "Manage All Leaves" },
//       ],
//     },
//     {
//       title: "Payroll Management",
//       icon: <DollarOutlined />,
//       color: "#722ed1",
//       items: [
//         { name: "permissions.payroll.view", label: "View Payroll" },
//         { name: "permissions.payroll.process", label: "Process Payroll" },
//         { name: "permissions.payroll.approve", label: "Approve Payroll" },
//       ],
//     },
//     {
//       title: "Recruitment",
//       icon: <UserAddOutlined />,
//       color: "#fa8c16",
//       items: [
//         { name: "permissions.recruitment.view", label: "View Applications" },
//         { name: "permissions.recruitment.create", label: "Create Job Posts" },
//         { name: "permissions.recruitment.evaluate", label: "Evaluate Candidates" },
//         { name: "permissions.recruitment.hire", label: "Hire Candidates" },
//       ],
//     },
//     {
//       title: "Assets Management",
//       icon: <LaptopOutlined />,
//       color: "#52c41a",
//       items: [
//         { name: "permissions.assets.view", label: "View Assets" },
//         { name: "permissions.assets.assign", label: "Assign Assets" },
//         { name: "permissions.assets.manage", label: "Manage Assets" },
//       ],
//     },
//     {
//       title: "Documents",
//       icon: <FileOutlined />,
//       color: "#fadb14",
//       items: [
//         { name: "permissions.documents.view", label: "View Documents" },
//         { name: "permissions.documents.upload", label: "Upload Documents" },
//         { name: "permissions.documents.verify", label: "Verify Documents" },
//       ],
//     },
//     {
//       title: "Settings",
//       icon: <SettingOutlined />,
//       color: "#ff4d4f",
//       items: [
//         { name: "permissions.settings.view", label: "View Settings" },
//         { name: "permissions.settings.edit", label: "Edit Settings" },
//       ],
//     },
//     {
//       title: "Email Notifications",
//       icon: <MailOutlined />,
//       color: "#eb2f96",
//       items: [
//         { name: "permissions.emailNotifications.manage", label: "Manage Email Notifications" },
//       ],
//     },
//   ];

//   return (
//     <div className="h-[92vh] overflow-y-auto    ">
//       <Card
//         title="User Permission Management"
//         bordered={false}
//         className="shadow-lg rounded-lg"
//       >
//         <div className="mb-6">
//           <Form form={searchForm} onValuesChange={handleSearch}>
//             <Form.Item name="search" className="mb-0">
//               <Input
//                 placeholder="Search users..."
//                 prefix={<SearchOutlined />}
//                 allowClear
//                 className="w-full md:w-1/2"
//               />
//             </Form.Item>
//           </Form>
          
//           {isSearching && <Spin className="mt-2" />}
          
//           {   Array.isArray(usersData?.data)  && usersData?.data?.length > 0 && (
//             <div className="mt-4">
//               <h4 className="font-medium mb-2">Suggested User:</h4>
//               <div className="flex flex-wrap gap-2">
//                 {usersData.data.map(user => (
//                   <Button
//                     key={user._id}
//                     type={selectedUserId === user._id ? "primary" : "default"}
//                     onClick={() => setSelectedUserId(user._id)}
//                     className="flex items-center"
//                   >
//                     {user.firstName} {user.lastName}
//                     {user.isAdmin && <span className="ml-2 text-xs">(Admin)</span>}
//                   </Button>
//                 ))}
//               </div>
              
//               {usersData.total > usersData.limit && (
//                 <div className="mt-4 flex justify-center">
//                   <Pagination
//                     current={usersData.page}
//                     total={usersData.total}
//                     pageSize={usersData.limit}
//                     onChange={(page) => setSearchParams(prev => ({ ...prev, page }))}
//                   />
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {selectedUserId && (
//           <Form  className=""  form={form} layout="vertical">
//             {isLoading ? (
//               <Spin size="large" className="flex justify-center my-8" />
//             ) : (
//               <>
//                 {permissionGroups.map((group, index) => (
//                   <div key={index}>
//                     <Divider orientation="left" className="text-lg font-semibold">
//                       <div className="flex items-center">
//                         <div
//                           className="p-2 rounded-full mr-3"
//                           style={{ backgroundColor: `${group.color}20`, color: group.color }}
//                         >
//                           {group.icon}
//                         </div>
//                         {group.title}
//                       </div>
//                     </Divider>
//                     <Row gutter={[16, 16]}>
//                       {group.items.map((item, itemIndex) => (
//                         <Col key={itemIndex} xs={24} sm={12} md={8} lg={6}>
//                           <Card
//                             hoverable
//                             className="shadow-md rounded-lg h-full"
//                             bodyStyle={{ padding: "16px" }}
//                           >
//                             <div className="flex justify-between items-center">
//                               <span className="font-medium">{item.label}</span>
//                               <Form.Item
//                                 name={item.name}
//                                 valuePropName="checked"
//                                 className="mb-0"
//                               >
//                                 <Switch
//                                   checkedChildren="ON"
//                                   unCheckedChildren="OFF"
//                                   style={{ backgroundColor: group.color }}
//                                 />
//                               </Form.Item>
//                             </div>
//                           </Card>
//                         </Col>
//                       ))}
//                     </Row>
//                   </div>
//                 ))}

//                 <div className="mt-6 text-left">
//                   <Button
//                     type="primary"
//                     onClick={handleSubmit}
//                     size="large"
//                     className="px-8 h-10 rounded-lg shadow-md"
//                     loading={updateMutation.isPending}
//                   >
//                     Save Permissions
//                   </Button>
//                 </div>
//               </>
//             )}
//           </Form>
//         )}
//       </Card>
//     </div>
//   );
// };

// export default UserPermissionManagement;


import React, { useEffect, useState } from "react";
import { Card, Switch, Divider, Form, Button, Row, Col, Spin, Input, Pagination } from "antd";
import {
  TeamOutlined,
  FileDoneOutlined,
  DollarOutlined,
  UserAddOutlined,
  LaptopOutlined,
  FileOutlined,
  SettingOutlined,
  MailOutlined,
  SearchOutlined
} from "@ant-design/icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { debounce } from "lodash";
import axios from "../axiosConfig";

export const fetchUserPermissions = async (userId) => {
  const response = await axios.get(`/api/v1/permission/users/${userId}/permissions`);
  return response.data;
};

export const updateUserPermissions = async ({ userId, permissions }) => {
  const response = await axios.put(`/api/v1/permission/users/${userId}/permissions`, { permissions });
  return response.data;
};

const UserPermissionManagement = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchParams, setSearchParams] = useState({
    search: "",
    page: 1,
    limit: 10,
  });

  // Search users with debounce
  const { data: usersData, isLoading: isSearching } = useQuery({
    queryKey: ["users", searchParams],
    queryFn: async () => {
      const response = await axios.get("/api/v1/user/staff", {
        params: {
          ...searchParams,
        },
      });
      return response.data;
    },          
  });

  // Fetch permissions for selected user
  const { data: userPermissions, refetch, isLoading } = useQuery({
    queryKey: ["userPermissions", selectedUserId],
    queryFn: () => fetchUserPermissions(selectedUserId),
    enabled: !!selectedUserId,
    onSuccess: (data) => {
      // Initialize form with default permissions if no permissions exist
      const permissionsWithDefaults = {
        canSeeAllApplications: false,
        // Add other default permissions here
        ...data
      };
      form.setFieldsValue(permissionsWithDefaults);
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateUserPermissions,
    onSuccess: () => {
      toast.success("Permissions updated successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update permissions");
    },
  });

  // Debounced search
  const handleSearch = debounce((values) => {
    setSearchParams(prev => ({
      ...prev,
      search: values.search,
      page: 1
    }));
  }, 500);

  const handleUserSelect = (user) => {
    setSelectedUserId(user._id);
    setSelectedUser(user);
    form.resetFields(); // Reset form when selecting new user
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await updateMutation.mutateAsync({
        userId: selectedUserId,
        permissions: values
      });
    } catch (err) {
      console.error("Error saving permissions:", err);
    }
  };

  const permissionGroups = [
    {
      title: "Employee Management",
      icon: <TeamOutlined />,
      color: "#1890ff",
      items: [
        { name: "canViewEmployees", label: "View Employees" },
        { name: "canCreateEmployees", label: "Create Employees" },
        { name: "canEditEmployees", label: "Edit Employees" },
        { name: "canDeleteEmployees", label: "Delete Employees" },
        { name: "canExportEmployeeData", label: "Export Data" },
      ],
    },
    {
      title: "Leave Management",
      icon: <FileDoneOutlined />,
      color: "#13c2c2",
      items: [
        { name: "canViewLeaves", label: "View Leaves" },
        { name: "canApproveLeaves", label: "Approve Leaves" },
        { name: "canRejectLeaves", label: "Reject Leaves" },
        { name: "canManageAllLeaves", label: "Manage All Leaves" },
      ],
    },
    {
      title: "Payroll Management",
      icon: <DollarOutlined />,
      color: "#722ed1",
      items: [
        { name: "canViewPayroll", label: "View Payroll" },
        { name: "canProcessPayroll", label: "Process Payroll" },
        { name: "canApprovePayroll", label: "Approve Payroll" },
      ],
    },
    {
      title: "Recruitment",
      icon: <UserAddOutlined />,
      color: "#fa8c16",
      items: [
        { name: "canViewApplications", label: "View Applications" },
        { name: "canCreateJobPosts", label: "Create Job Posts" },
        { name: "canEvaluateCandidates", label: "Evaluate Candidates" },
        { name: "canHireCandidates", label: "Hire Candidates" },
        { name: "canSeeAllApplications", label: "See All Applications" },
      ],
    },
    {
      title: "Assets Management",
      icon: <LaptopOutlined />,
      color: "#52c41a",
      items: [
        { name: "canViewAssets", label: "View Assets" },
        { name: "canAssignAssets", label: "Assign Assets" },
        { name: "canManageAssets", label: "Manage Assets" },
      ],
    },
    {
      title: "Documents",
      icon: <FileOutlined />,
      color: "#fadb14",
      items: [
        { name: "canViewDocuments", label: "View Documents" },
        { name: "canUploadDocuments", label: "Upload Documents" },
        { name: "canVerifyDocuments", label: "Verify Documents" },
      ],
    },
    {
      title: "Settings",
      icon: <SettingOutlined />,
      color: "#ff4d4f",
      items: [
        { name: "canViewSettings", label: "View Settings" },
        { name: "canEditSettings", label: "Edit Settings" },
      ],
    },
    {
      title: "Email Notifications",
      icon: <MailOutlined />,
      color: "#eb2f96",
      items: [
        { name: "canManageEmailNotifications", label: "Manage Email Notifications" },
      ],
    },
  ];

  return (
    <div className="h-[92vh] overflow-y-auto">
      <Card
        title="User Permission Management"
        bordered={false}
        className="shadow-lg rounded-lg"
      >
        <div className="mb-6">
          <Form form={searchForm} onValuesChange={handleSearch}>
            <Form.Item name="search" className="mb-0">
              <Input
                placeholder="Search users..."
                prefix={<SearchOutlined />}
                allowClear
                className="w-full md:w-1/2"
              />
            </Form.Item>
          </Form>
          
          {isSearching && <Spin className="mt-2" />}
          
          {Array.isArray(usersData?.data) && usersData?.data?.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Suggested User:</h4>
              <div className="flex flex-wrap gap-2">
                {usersData.data.map(user => (
                  <Button
                    key={user._id}
                    type={selectedUserId === user._id ? "primary" : "default"}
                    onClick={() => handleUserSelect(user)}
                    className="flex items-center"
                  >
                    {user.firstName} {user.lastName}
                    {user.isAdmin && <span className="ml-2 text-xs">(Admin)</span>}
                  </Button>
                ))}
              </div>
              
              {usersData.total > usersData.limit && (
                <div className="mt-4 flex justify-center">
                  <Pagination
                    current={usersData.page}
                    total={usersData.total}
                    pageSize={usersData.limit}
                    onChange={(page) => setSearchParams(prev => ({ ...prev, page }))}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {selectedUserId && (
          <>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">
                Editing permissions for: {selectedUser?.firstName} {selectedUser?.lastName}
              </h3>
              <p className="text-gray-600">{selectedUser?.email}</p>
            </div>
            
            <Form form={form} layout="vertical">
              {isLoading ? (
                <Spin size="large" className="flex justify-center my-8" />
              ) : (
                <>
                  {permissionGroups.map((group, index) => (
                    <div key={index}>
                      <Divider orientation="left" className="text-lg font-semibold">
                        <div className="flex items-center">
                          <div
                            className="p-2 rounded-full mr-3"
                            style={{ backgroundColor: `${group.color}20`, color: group.color }}
                          >
                            {group.icon}
                          </div>
                          {group.title}
                        </div>
                      </Divider>
                      <Row gutter={[16, 16]}>
                        {group.items.map((item, itemIndex) => (
                          <Col key={itemIndex} xs={24} sm={12} md={8} lg={6}>
                            <Card
                              hoverable
                              className="shadow-md rounded-lg h-full"
                              bodyStyle={{ padding: "16px" }}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{item.label}</span>
                                <Form.Item
                                  name={item.name}
                                  valuePropName="checked"
                                  className="mb-0"
                                >
                                  <Switch
                                    checkedChildren="ON"
                                    unCheckedChildren="OFF"
                                    style={{ backgroundColor: group.color }}
                                  />
                                </Form.Item>
                              </div>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  ))}

                  <div className="mt-6 text-left">
                    <Button
                      type="primary"
                      onClick={handleSubmit}
                      size="large"
                      className="px-8 h-10 rounded-lg shadow-md"
                      loading={updateMutation.isPending}
                    >
                      Save Permissions
                    </Button>
                  </div>
                </>
              )}
            </Form>
          </>
        )}
      </Card>
    </div>
  );
};

export default UserPermissionManagement;