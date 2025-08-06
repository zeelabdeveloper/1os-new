import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  Avatar,
  message,
  Tag,
  Skeleton,
  Empty,
  Button,
  Space,
  Divider,
  Descriptions,
  Badge,
  Popconfirm,
  DatePicker,
  Switch,
  Select,
  Input,
  InputNumber,
} from "antd";
import {
  UserOutlined,
  IdcardOutlined,
  BankOutlined,
  DollarOutlined,
  ApartmentOutlined,
  ClockCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  EditOutlined,
  FilePdfOutlined,
  DeleteOutlined,
  TeamOutlined,
  UploadOutlined,
  PlusOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  EyeOutlined,
  CloseOutlined,
  CheckOutlined,
  DeliveredProcedureOutlined,
} from "@ant-design/icons";
import axios from "../../axiosConfig";
import dayjs from "dayjs";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { useQuery } from "@tanstack/react-query";
import {
  fetchBranches,
  fetchDepartmentsByBranch,
  fetchRoleByDepartment,
  fetchZonesByBranch,
} from "../../api/auth";
import axiosInstance from "../../axiosConfig";
const { Option } = Select;

const ViewStaff = () => {
  const [searchParams] = useSearchParams();
  const empId = searchParams.get("emp");
  const [loading, setLoading] = useState(true);
  const [staffData, setStaffData] = useState(null);
  const [error, setError] = useState(null);
  const [editingSection, setEditingSection] = useState(null);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/v1/user/staff/${empId}`);
      console.log(response.data);
      setStaffData(response.data.data);
    } catch (err) {
      console.error("Error fetching staff data:", err);
      setError(err.response?.data?.message || "Failed to fetch staff data");
      message.error("Failed to fetch staff details");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (empId) {
      fetchStaffData();
    } else {
      setError("No employee ID provided");
      setLoading(false);
    }
  }, [empId]);

  const updateStaffMutation = useMutation({
    mutationFn: async (updatedData) => {
      const response = await axios.put(
        `/api/v1/user/staff/${empId}`,
        updatedData
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Staff details updated successfully");
      fetchStaffData();
      setEditingSection(null);
    },
    onError: (error) => {
      message.error(
        `Update failed: ${error.response?.data?.message || error.message}`
      );
    },
  });

  const handleEditSection = (section) => {
    setEditingSection(section);
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
  };

  const handleSave = (sectionData) => {
    console.log(sectionData);
    console.log(editingSection)
    updateStaffMutation.mutate({
      [editingSection]: sectionData,
    });
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="shadow-lg">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span className="text-red-500">{error}</span>}
          >
            <Button type="primary" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div className=" h-[92vh] overflow-y-auto mx-auto px-4 py-8">
      <Card
        className="shadow-lg"
        title={
          <div className="flex justify-between items-center">
            <span className="text-xl font-semibold">Employee Details</span>
          </div>
        }
      >
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4 flex flex-col items-center">
            {loading ? (
              <>
                <Skeleton.Avatar active size={150} shape="circle" />
                <Skeleton.Input active className="mt-4 w-40" />
                <Skeleton.Input active className="mt-2 w-32" size="small" />
                <Skeleton.Input active className="mt-2 w-32" size="small" />
                <Skeleton.Button active className="mt-4" size="small" />
              </>
            ) : (
              <>
                <div className="w-[150px] h-[150px] rounded-full overflow-hidden border border-gray-300 shadow-2xl mb-4 flex items-center justify-center bg-gray-100">
                  {staffData?.Profile?.photo ? (
                    <img
                      src={staffData.Profile.photo}
                      alt="Profile"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <UserOutlined style={{ fontSize: "48px", color: "#aaa" }} />
                  )}
                </div>
                <h2 className="text-2xl mt-3 font-bold text-center">
                  {staffData?.firstName} {staffData?.lastName}
                </h2>
                <p className="text-gray-600 mb-2 flex items-center">
                  <MailOutlined className="mr-2" />
                  {staffData?.email}
                </p>
                {staffData?.contactNumber && (
                  <p className="text-gray-600 mb-4 flex items-center">
                    <PhoneOutlined className="mr-2" />
                    {staffData.contactNumber}
                  </p>
                )}
                <div className="flex gap-2 mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-white text-sm font-semibold transition-all duration-500 shadow-md
      ${
        staffData?.isActive
          ? "bg-green-500 animate-pulse"
          : "bg-red-500 animate-pulse"
      }
    `}
                  >
                    {staffData?.isActive ? "Active" : "Inactive"}
                  </span>

                  {staffData?.isCocoEmployee && (
                    <span className="px-3 py-1 rounded-full bg-green-600 text-white text-sm font-semibold transition-all duration-500 shadow-md hover:scale-105 animate-fade-in">
                      COCO
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right Details Section */}
          <div className="w-full md:w-3/4 space-y-6">
            {/* Personal Details Card */}
            <PersonalDetailsCard
              data={staffData}
              loading={loading}
              isEditing={editingSection === "personal"}
              onEdit={() => handleEditSection("personal")}
              onCancel={handleCancelEdit}
              onSave={handleSave}
            />
            <ProfileCard
              data={staffData?.Profile}
              loading={loading}
              isEditing={editingSection === "profile"}
              onEdit={() => handleEditSection("profile")}
              onCancel={handleCancelEdit}
              onSave={handleSave}
            />

            {/* Organization Details Card */}
            <OrganizationCard
              data={staffData?.Organization}
              employee={staffData?.EmployeeId}
              loading={loading}
              isEditing={editingSection === "organization"}
              onEdit={() => handleEditSection("organization")}
              onCancel={handleCancelEdit}
              onSave={handleSave}
            />

            {/* Bank Details Card */}
            <BankDetailsCard
              data={staffData?.Bank}
              loading={loading}
              isEditing={editingSection === "bank"}
              onEdit={() => handleEditSection("bank")}
              onCancel={handleCancelEdit}
              onSave={handleSave}
            />

            {/* Salary Details Card */}
            <SalaryDetailsCard
              data={staffData?.Salary}
              loading={loading}
              isEditing={editingSection === "salary"}
              onEdit={() => handleEditSection("salary")}
              onCancel={handleCancelEdit}
              onSave={handleSave}
            />

            {/* Experience Card */}
            <ExperienceCard
              data={staffData?.Experience}
              loading={loading}
              isEditing={editingSection === "experience"}
              onEdit={() => handleEditSection("experience")}
              onCancel={handleCancelEdit}
              onSave={handleSave}
            />

            <AssetCard
              data={staffData?.Asset}
              loading={loading}
              isEditing={editingSection === "asset"}
              onEdit={() => handleEditSection("asset")}
              onCancel={handleCancelEdit}
              onSave={handleSave}
            />
            <DocumentCard
              data={staffData?.Document}
              loading={loading}
              isEditing={editingSection === "document"}
              onEdit={() => handleEditSection("document")}
              onCancel={handleCancelEdit}
              onSave={handleSave}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

// Personal Details Card Component
const PersonalDetailsCard = ({
  data,
  loading,
  isEditing,
  onEdit,
  onCancel,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    firstName: data?.firstName || "",
    lastName: data?.lastName || "",
    email: data?.email || "",
    contactNumber: data?.contactNumber || "",
    dateOfJoining: data?.dateOfJoining || "",
    isActive: data?.isActive || false,
  });

  useEffect(() => {
    if (data) {
      setFormData({
        firstName: data?.firstName || "",
        lastName: data?.lastName || "",
        email: data?.email || "",
        contactNumber: data?.contactNumber || "",
        dateOfJoining: data?.dateOfJoining || "",
        isActive: data.isActive || false,
      });
    }
  }, [data]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <IdcardOutlined className="mr-2" />
            Personal Details
          </span>
          {!isEditing ? (
            <Button icon={<EditOutlined />} onClick={onEdit} disabled={loading}>
              Edit
            </Button>
          ) : (
            <Space>
              <Button onClick={onCancel}>Cancel</Button>
              <Button type="primary"  onClick={() => onSave(formData)}>
                Save
              </Button>
            </Space>
          )}
        </div>
      }
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditableField
            label="First Name"
            value={formData?.firstName}
            onChange={(value) => handleChange("firstName", value)}
          />
          <EditableField
            label="Last Name"
            value={formData?.lastName}
            onChange={(value) => handleChange("lastName", value)}
          />
          <EditableField
            label="Email"
            value={formData?.email}
            onChange={(value) => handleChange("email", value)}
          />
          <EditableField
            label="Contact Number"
            value={formData?.contactNumber}
            onChange={(value) => handleChange("contactNumber", value)}
          />
          <EditableField
            label="Date of Joining"
            value={formData?.dateOfJoining}
            type="date"
            onChange={(value) => handleChange("dateOfJoining", value)}
          />
          <EditableField
            label="Status"
            value={formData?.isActive}
            type="switch"
            checkedChildren="Active"
            unCheckedChildren="Inactive"
            onChange={(value) => handleChange("isActive", value)}
          />
        </div>
      ) : (
        <Descriptions column={2}>
          <Descriptions.Item label="First Name">
            {data?.firstName || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Last Name">
            {data?.lastName || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {data?.email || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Contact Number">
            {data?.contactNumber || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Date of Joining">
            {data?.dateOfJoining
              ? format(new Date(data.dateOfJoining), "PPP")
              : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Badge
              status={data?.isActive ? "success" : "error"}
              text={data?.isActive ? "Active" : "Inactive"}
            />
          </Descriptions.Item>
        </Descriptions>
      )}
    </Card>
  );
};

const ProfileCard = ({
  data,
  loading,
  isEditing,
  onEdit,
  onCancel,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    dateOfBirth: "",
    gender: "",
    address: "",
    state: "",
    district: "",

    family: {
      fatherName: "",
      fatherOccupation: "",
      motherName: "",
      motherOccupation: "",
      numberOfBrothers: 0,
      numberOfSisters: 0,
      hasCrimeRecord: false,
      crimeReason: "",
    },
  });

  useEffect(() => {
    if (data) {
      setFormData({
        dateOfBirth: data.dateOfBirth || "",
        gender: data.gender || "",
        address: data.address || "",
        state: data.state || "",
        district: data.district || "",

        family: {
          fatherName: data.family?.fatherName || "",
          fatherOccupation: data.family?.fatherOccupation || "",
          motherName: data.family?.motherName || "",
          motherOccupation: data.family?.motherOccupation || "",
          numberOfBrothers: data.family?.numberOfBrothers || 0,
          numberOfSisters: data.family?.numberOfSisters || 0,
          hasCrimeRecord: data.family?.hasCrimeRecord || false,
          crimeReason: data.family?.crimeReason || "",
        },
      });
    }
  }, [data]);

  const handleChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <UserOutlined className="mr-2" />
            Profile Details
          </span>
          {!isEditing ? (
            <Button icon={<EditOutlined />} onClick={onEdit} disabled={loading}>
              Edit
            </Button>
          ) : (
            <Space>
              <Button onClick={onCancel}>Cancel</Button>
              <Button type="primary" onClick={() => onSave(formData)}>
                Save
              </Button>
            </Space>
          )}
        </div>
      }
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : isEditing ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Date of Birth
              </label>
              <DatePicker
                className="w-full"
                value={
                  formData.dateOfBirth ? dayjs(formData.dateOfBirth) : null
                }
                onChange={(date, dateString) =>
                  handleChange("dateOfBirth", dateString)
                }
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Gender
              </label>
              <Select
                className="w-full"
                value={formData.gender}
                onChange={(value) => handleChange("gender", value)}
                options={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                ]}
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Address
              </label>
              <Input
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                State
              </label>
              <Input
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                District/City
              </label>
              <Input
                value={formData.district}
                onChange={(e) => handleChange("district", e.target.value)}
              />
            </div>
          </div>

          <Divider orientation="left" orientationMargin={0}>
            <TeamOutlined className="mr-2" />
            Family Details
          </Divider>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Father's Name
              </label>
              <Input
                value={formData.family.fatherName}
                onChange={(e) =>
                  handleChange("family.fatherName", e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Father's Occupation
              </label>
              <Input
                value={formData.family.fatherOccupation}
                onChange={(e) =>
                  handleChange("family.fatherOccupation", e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Mother's Name
              </label>
              <Input
                value={formData.family.motherName}
                onChange={(e) =>
                  handleChange("family.motherName", e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Mother's Occupation
              </label>
              <Input
                value={formData.family.motherOccupation}
                onChange={(e) =>
                  handleChange("family.motherOccupation", e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Number of Brothers
              </label>
              <InputNumber
                className="w-full"
                value={formData.family.numberOfBrothers}
                onChange={(value) =>
                  handleChange("family.numberOfBrothers", value)
                }
                min={0}
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Number of Sisters
              </label>
              <InputNumber
                className="w-full"
                value={formData.family.numberOfSisters}
                onChange={(value) =>
                  handleChange("family.numberOfSisters", value)
                }
                min={0}
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Has Crime Record
              </label>
              <Switch
                checked={
                  formData.family.hasCrimeRecord === "yes" ? true : false
                }
                onChange={(checked) =>
                  handleChange(
                    "family.hasCrimeRecord",
                    checked === true ? "yes" : "no"
                  )
                }
                checkedChildren="Yes"
                unCheckedChildren="No"
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Crime Reason
              </label>
              <Input
                value={formData.family.crimeReason}
                onChange={(e) =>
                  handleChange("family.crimeReason", e.target.value)
                }
              />
            </div>
          </div>
        </div>
      ) : (
        // <div className="space-y-6">
        //   <Descriptions column={2}>
        //     <Descriptions.Item label="Date of Birth">
        //       {data?.dateOfBirth
        //         ? dayjs(data.dateOfBirth).format("DD MMMM YYYY")
        //         : "N/A"}
        //     </Descriptions.Item>
        //     <Descriptions.Item label="Gender">
        //       {data?.gender
        //         ? data.gender.charAt(0).toUpperCase() + data.gender.slice(1)
        //         : "N/A"}
        //     </Descriptions.Item>
        //     <Descriptions.Item label="Address">
        //       {data?.address || "N/A"}
        //     </Descriptions.Item>
        //     <Descriptions.Item label="State">
        //       {data?.state || "N/A"}
        //     </Descriptions.Item>
        //     <Descriptions.Item label="District/City">
        //       {data?.district || "N/A"}
        //     </Descriptions.Item>
        //   </Descriptions>

        //   <Divider orientation="left" orientationMargin={0}>
        //     <TeamOutlined className="mr-2" />
        //     Family Details
        //   </Divider>

        //   <Descriptions column={2}>
        //     <Descriptions.Item label="Father's Name">
        //       {data?.family?.fatherName || "N/A"}
        //     </Descriptions.Item>
        //     <Descriptions.Item label="Father's Occupation">
        //       {data?.family?.fatherOccupation || "N/A"}
        //     </Descriptions.Item>
        //     <Descriptions.Item label="Mother's Name">
        //       {data?.family?.motherName || "N/A"}
        //     </Descriptions.Item>
        //     <Descriptions.Item label="Mother's Occupation">
        //       {data?.family?.motherOccupation || "N/A"}
        //     </Descriptions.Item>
        //     <Descriptions.Item label="Brothers">
        //       {data?.family?.numberOfBrothers ?? "N/A"}
        //     </Descriptions.Item>
        //     <Descriptions.Item label="Sisters">
        //       {data?.family?.numberOfSisters ?? "N/A"}
        //     </Descriptions.Item>
        //     <Descriptions.Item label="Crime Record">
        //       <Badge
        //         status={data?.family?.hasCrimeRecord ? "error" : "success"}
        //         text={data?.family?.hasCrimeRecord ? "Yes" : "No"}
        //       />
        //     </Descriptions.Item>
        //     <Descriptions.Item label="Crime Reason">
        //       {data?.family?.crimeReason ?? "N/A"}
        //     </Descriptions.Item>
        //   </Descriptions>
        // </div>

        <div className="space-y-6">
          <Descriptions column={2}>
            {data?.dateOfBirth && (
              <Descriptions.Item label="Date of Birth">
                {dayjs(data.dateOfBirth).format("DD MMMM YYYY")}
              </Descriptions.Item>
            )}

            {data?.gender && (
              <Descriptions.Item label="Gender">
                {data.gender.charAt(0).toUpperCase() + data.gender.slice(1)}
              </Descriptions.Item>
            )}

            {data?.address && (
              <Descriptions.Item label="Address">
                {data.address}
              </Descriptions.Item>
            )}

            {data?.state && (
              <Descriptions.Item label="State">{data.state}</Descriptions.Item>
            )}

            {data?.district && (
              <Descriptions.Item label="District/City">
                {data.district}
              </Descriptions.Item>
            )}
          </Descriptions>

          {data?.family &&
            (data.family.fatherName ||
              data.family.fatherOccupation ||
              data.family.motherName ||
              data.family.motherOccupation ||
              data.family.numberOfBrothers != null ||
              data.family.numberOfSisters != null ||
              data.family.hasCrimeRecord != null ||
              data.family.crimeReason) && (
              <>
                <Divider orientation="left" orientationMargin={0}>
                  <TeamOutlined className="mr-2" />
                  Family Details
                </Divider>

                <Descriptions column={2}>
                  {data.family.fatherName && (
                    <Descriptions.Item label="Father's Name">
                      {data.family.fatherName}
                    </Descriptions.Item>
                  )}

                  {data.family.fatherOccupation && (
                    <Descriptions.Item label="Father's Occupation">
                      {data.family.fatherOccupation}
                    </Descriptions.Item>
                  )}

                  {data.family.motherName && (
                    <Descriptions.Item label="Mother's Name">
                      {data.family.motherName}
                    </Descriptions.Item>
                  )}

                  {data.family.motherOccupation && (
                    <Descriptions.Item label="Mother's Occupation">
                      {data.family.motherOccupation}
                    </Descriptions.Item>
                  )}

                  {data.family.numberOfBrothers != null && (
                    <Descriptions.Item label="Brothers">
                      {data.family.numberOfBrothers}
                    </Descriptions.Item>
                  )}

                  {data.family.numberOfSisters != null && (
                    <Descriptions.Item label="Sisters">
                      {data.family.numberOfSisters}
                    </Descriptions.Item>
                  )}

                  {data.family.hasCrimeRecord != null && (
                    <Descriptions.Item label="Crime Record">
                      <Badge
                        status={
                          data.family.hasCrimeRecord === "yes"
                            ? "error"
                            : "success"
                        }
                        text={
                          data.family.hasCrimeRecord === "yes" ? "Yes" : "No"
                        }
                      />
                    </Descriptions.Item>
                  )}

                  {data.family.crimeReason && (
                    <Descriptions.Item label="Crime Reason">
                      {data.family.crimeReason}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </>
            )}
        </div>
      )}
    </Card>
  );
};

// Organization Card Component

const OrganizationCard = ({
  data,
  employee,
  loading,
  isEditing,
  onEdit,
  onCancel,
  onSave,
}) => {
  // Form state - stores only IDs
  const [formData, setFormData] = useState({
    branch: null,
    department: null,
    role: null,
    zone: null,
    employmentType: "full-time",
    isActive: true,
  });

  // API Fetch Functions (replace with your actual API calls)

  // Data Fetching with React Query
  // Branches
  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
  });

  // Departments (depends on formData.branch)
  const { data: departments = [] } = useQuery({
    queryKey: ["departments", formData.branch],
    queryFn: () => fetchDepartmentsByBranch(formData.branch),
    enabled: !!formData.branch,
  });
  // Departments (depends on formData.branch)
  const { data: zones = [] } = useQuery({
    queryKey: ["zones", formData.branch],
    queryFn: () => fetchZonesByBranch(formData.branch),
    enabled: !!formData.branch,
  });

  // Roles (depends on formData.department)
  const { data: roles = [] } = useQuery({
    queryKey: ["roles", formData.department],
    queryFn: () => fetchRoleByDepartment(formData.department),
    enabled: !!formData.department,
  });

  // Initialize form data
  useEffect(() => {
    if (data) {
      setFormData({
        branch: data?.branch?._id || null,
        department: data?.department?._id || null,
        zone: data?.zone?._id || null,
        role: data?.role?._id || null,
        employmentType: data?.employmentType || "full-time",
        isActive: data?.isActive ?? true,
      });
    }
  }, [data]);

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const newState = { ...prev, [field]: value };

      // Reset logic
      if (field === "branch") {
        newState.department = null;
        newState.role = null;
      } else if (field === "department") {
        newState.role = null;
      }
      // Role change doesn't affect anything

      return newState;
    });
  };

  const handleSave = () => {
    if (!formData.branch || !formData.department || !formData.role) {
      toast.error("Please select branch, department and role");
      return;
    }
    onSave(formData);
  };

  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <ApartmentOutlined className="mr-2" />
            Organization Details
          </span>
          {!isEditing ? (
            <Button icon={<EditOutlined />} onClick={onEdit} disabled={loading}>
              Edit
            </Button>
          ) : (
            <Space>
              <Button onClick={onCancel}>Cancel</Button>
              <Button type="primary" onClick={handleSave}>
                Save
              </Button>
            </Space>
          )}
        </div>
      }
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Branch Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Branch</label>
            <Select
              value={formData.branch}
              onChange={(value) => handleChange("branch", value)}
              placeholder="Select Branch"
              className="w-full"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
              loading={!branches}
            >
              {branches.map((branch) => (
                <Option key={branch._id} value={branch._id}>
                  {branch.name}
                </Option>
              ))}
            </Select>
          </div>

          {/* Department Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <Select
              value={formData.department}
              onChange={(value) => handleChange("department", value)}
              placeholder="Select Department"
              className="w-full"
              disabled={!formData.branch}
              loading={formData.branch && departments.length === 0}
              showSearch
              optionFilterProp="children"
            >
              {departments.map((dept) => (
                <Option key={dept._id} value={dept._id}>
                  {dept.name}
                </Option>
              ))}
            </Select>
          </div>
          {/* Zone Selection */}
         {  <div>
            <label className="block text-sm font-medium mb-1">Zone</label>
            <Select
              value={formData.zone}
              onChange={(value) => handleChange("zone", value)}
              placeholder="Select Zone"
              className="w-full"
              disabled={!formData.branch}
              loading={formData.branch && zones.length === 0}
              showSearch
              optionFilterProp="children"
            >
              {zones.map((dept) => (
                <Option key={dept._id} value={dept._id}>
                  {dept.name}
                </Option>
              ))}
            </Select>
          </div>}

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <Select
              value={formData.role}
              onChange={(value) => handleChange("role", value)}
              placeholder="Select Role"
              className="w-full"
              disabled={!formData.department}
              loading={formData.department && roles.length === 0}
              showSearch
              optionFilterProp="children"
            >
              {roles.map((role) => (
                <Option key={role._id} value={role._id}>
                  {role.name}
                </Option>
              ))}
            </Select>
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Employment Type
            </label>
            <Select
              value={formData.employmentType}
              onChange={(value) => handleChange("employmentType", value)}
              className="w-full"
            >
              <Option value="full-time">Full Time</Option>
              <Option value="part-time">Part Time</Option>
              <Option value="contract">Contract</Option>
            </Select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <div className="flex items-center">
              <Switch
                checked={formData.isActive}
                onChange={(checked) => handleChange("isActive", checked)}
                checkedChildren="Active"
                unCheckedChildren="Inactive"
              />
            </div>
          </div>
        </div>
      ) : (
        // View Mode
        <Descriptions column={2}>
          <Descriptions.Item label="Branch">
            {data?.branch?.name || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Department">
            {data?.department?.name || "N/A"}
          </Descriptions.Item>
          {data?.zone?.name && (
            <Descriptions.Item label="Zone">
              {data?.zone?.name || "N/A"}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Role">
            {data?.role?.name || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Employee ID">
            {employee?.employeeId || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Employment Type">
            {data?.employmentType
              ? data.employmentType.charAt(0).toUpperCase() +
                data.employmentType.slice(1)
              : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Badge
              status={data?.isActive ? "success" : "error"}
              text={data?.isActive ? "Active" : "Inactive"}
            />
          </Descriptions.Item>
        </Descriptions>
      )}
    </Card>
  );
};

// Bank Details Card Component
// const BankDetailsCard = ({
//   data,
//   loading,
//   isEditing,
//   onEdit,
//   onCancel,
//   onSave,
// }) => {
//   const [formData, setFormData] = useState({
//     accountNumber: data?.accountNumber || "",
//     bankName: data?.bankName || "",
//     accountType: data?.accountType || "savings",
//     accountHolderName: data?.accountHolderName || "",
//     ifscCode: data?.ifscCode || "",
//     branch: data?.branch || "",
//     verified: data?.verified || false,
//   });

//   useEffect(() => {
//     if (data) {
//       setFormData({
//         accountNumber: data.accountNumber || "",
//         bankName: data.bankName || "",
//         accountType: data.accountType || "savings",
//         accountHolderName: data.accountHolderName || "",
//         ifscCode: data.ifscCode || "",
//         branch: data.branch || "",
//         verified: data?.verified || false,
//       });
//     }
//   }, [data]);

//   const handleChange = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   if (loading) {
//     return (
//       <Card>
//         <Skeleton active paragraph={{ rows: 4 }} />
//       </Card>
//     );
//   }

//   if (!data) {
//     return (
//       <Card
//         title={
//           <div className="flex justify-between items-center">
//             <span className="flex items-center">
//               <BankOutlined className="mr-2" />
//               Bank Details
//             </span>
//             <Button icon={<EditOutlined />} onClick={onEdit}>
//               Add Bank Details
//             </Button>
//           </div>
//         }
//       >
//         <Empty description="No bank details available" />
//       </Card>
//     );
//   }

//   return (
//     <Card
//       title={
//         <div className="flex justify-between items-center">
//           <span className="flex items-center">
//             <BankOutlined className="mr-2" />
//             Bank Details
//           </span>
//           {!isEditing ? (
//             <Button icon={<EditOutlined />} onClick={onEdit} disabled={loading}>
//               Edit
//             </Button>
//           ) : (
//             <Space>
//               <Button onClick={onCancel}>Cancel</Button>
//               <Button type="primary" onClick={() => onSave(formData)}>
//                 Save
//               </Button>
//             </Space>
//           )}
//         </div>
//       }
//     >
//       {isEditing ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <EditableField
//             label="Bank Name"
//             value={formData.bankName}
//             onChange={(value) => handleChange("bankName", value)}
//           />
//           <EditableField
//             label="Account Number"
//             value={formData.accountNumber}
//             onChange={(value) => handleChange("accountNumber", value)}
//           />
//           <EditableField
//             label="Account Holder Name"
//             value={formData.accountHolderName}
//             onChange={(value) => handleChange("accountHolderName", value)}
//           />
//           <EditableField
//             label="Account Type"
//             value={formData.accountType}
//             type="select"
//             options={[
//               { value: "savings", label: "Savings" },
//               { value: "current", label: "Current" },
//               { value: "salary", label: "Salary" },
//             ]}
//             onChange={(value) => handleChange("accountType", value)}
//           />
//           <EditableField
//             label="IFSC Code"
//             value={formData.ifscCode}
//             onChange={(value) => handleChange("ifscCode", value)}
//           />
//           <EditableField
//             label="Branch"
//             value={formData.branch}
//             onChange={(value) => handleChange("branch", value)}
//           />

//           <Switch
//             checked={formData.verified}
//             onChange={(checked) => handleChange("verified", checked)}
//             checkedChildren="Varified"
//             unCheckedChildren="Not Varified"
//           />
//         </div>
//       ) : (
//         <Descriptions column={2}>
//           <Descriptions.Item label="Bank Name">
//             {data.bankName || "N/A"}
//           </Descriptions.Item>
//           <Descriptions.Item label="Account Number">
//             {data.accountNumber || "N/A"}
//           </Descriptions.Item>
//           <Descriptions.Item label="Account Holder">
//             {data.accountHolderName || "N/A"}
//           </Descriptions.Item>
//           <Descriptions.Item label="Account Type">
//             {data.accountType
//               ? data.accountType.charAt(0).toUpperCase() +
//                 data.accountType.slice(1)
//               : "N/A"}
//           </Descriptions.Item>
//           <Descriptions.Item label="IFSC Code">
//             {data.ifscCode || "N/A"}
//           </Descriptions.Item>
//           <Descriptions.Item label="Branch">
//             {data.branch || "N/A"}
//           </Descriptions.Item>
//           <Descriptions.Item label="Verification Status">
//             <Badge
//               status={data.verified ? "success" : "error"}
//               text={data.verified ? "Verified" : "Not Verified"}
//             />
//           </Descriptions.Item>
//         </Descriptions>
//       )}
//     </Card>
//   );
// };

const BankDetailsCard = ({
  data,
  loading,
  isEditing,
  onEdit,
  onCancel,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    accountNumber: "",
    bankName: "",
    accountType: "savings",
    accountHolderName: "",
    ifscCode: "",
    branch: "",
    verified: false,
  });

  useEffect(() => {
    if (data) {
      setFormData({
        accountNumber: data.accountNumber || "",
        bankName: data.bankName || "",
        accountType: data.accountType || "savings",
        accountHolderName: data.accountHolderName || "",
        ifscCode: data.ifscCode || "",
        branch: data.branch || "",
        verified: data.verified || false,
      });
    }
  }, [data]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <BankOutlined className="mr-2" />
            Bank Details
          </span>
          {!isEditing ? (
            <Button
              icon={data ? <EditOutlined /> : <PlusOutlined />}
              onClick={onEdit}
              disabled={loading}
            >
              {data ? "Edit" : "Add Bank Details"}
            </Button>
          ) : (
            <Space>
              <Button onClick={onCancel}>Cancel</Button>
              <Button type="primary" onClick={() => onSave(formData)}>
                Save
              </Button>
            </Space>
          )}
        </div>
      }
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1">
              Bank Name
            </label>
            <Input
              value={formData.bankName}
              onChange={(e) => handleChange("bankName", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1">
              Account Number
            </label>
            <Input
              value={formData.accountNumber}
              onChange={(e) => handleChange("accountNumber", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1">
              Account Holder Name
            </label>
            <Input
              value={formData.accountHolderName}
              onChange={(e) =>
                handleChange("accountHolderName", e.target.value)
              }
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1">
              Account Type
            </label>
            <Select
              className="w-full"
              value={formData.accountType}
              onChange={(value) => handleChange("accountType", value)}
              options={[
                { value: "savings", label: "Savings" },
                { value: "current", label: "Current" },
                { value: "salary", label: "Salary" },
              ]}
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1">
              IFSC Code
            </label>
            <Input
              value={formData.ifscCode}
              onChange={(e) => handleChange("ifscCode", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1">
              Branch
            </label>
            <Input
              value={formData.branch}
              onChange={(e) => handleChange("branch", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1">
              Verification Status
            </label>
            <Switch
              checked={formData.verified}
              onChange={(checked) => handleChange("verified", checked)}
              checkedChildren="Verified"
              unCheckedChildren="Not Verified"
            />
          </div>
        </div>
      ) : !data ? (
        <Empty description="No bank details available" />
      ) : (
        <Descriptions column={2}>
          {data.bankName && (
            <Descriptions.Item label="Bank Name">
              {data.bankName}
            </Descriptions.Item>
          )}

          {data.accountNumber && (
            <Descriptions.Item label="Account Number">
              {data.accountNumber}
            </Descriptions.Item>
          )}

          {data.accountHolderName && (
            <Descriptions.Item label="Account Holder">
              {data.accountHolderName}
            </Descriptions.Item>
          )}

          {data.accountType && (
            <Descriptions.Item label="Account Type">
              {data.accountType.charAt(0).toUpperCase() +
                data.accountType.slice(1)}
            </Descriptions.Item>
          )}

          {data.ifscCode && (
            <Descriptions.Item label="IFSC Code">
              {data.ifscCode}
            </Descriptions.Item>
          )}

          {data.branch && (
            <Descriptions.Item label="Branch">{data.branch}</Descriptions.Item>
          )}

          <Descriptions.Item label="Verification Status">
            <Badge
              status={data.verified ? "success" : "error"}
              text={data.verified ? "Verified" : "Not Verified"}
            />
          </Descriptions.Item>
        </Descriptions>
      )}
    </Card>
  );
};

// Salary Details Card Component
// const SalaryDetailsCard = ({
//   data,
//   loading,
//   isEditing,
//   onEdit,
//   onCancel,
//   onSave,
// }) => {
//   const [formData, setFormData] = useState({
//     basicSalary: data?.basicSalary || 0,
//     hra: data?.hra || 0,
//     da: data?.da || 0,
//     conveyance: data?.conveyance || 0,
//     medical: data?.medical || 0,
//     otherAllow: data?.otherAllow || 0,
//     pf: data?.pf || 0,
//     tds: data?.tds || 0,
//     esi: data?.esi || 0,
//     paymentFrequency: data?.paymentFrequency || "monthly",
//   });

//   useEffect(() => {
//     if (data) {
//       setFormData({
//         basicSalary: data.basicSalary || 0,
//         hra: data.hra || 0,
//         da: data.da || 0,
//         conveyance: data.conveyance || 0,
//         medical: data.medical || 0,
//         otherAllow: data.otherAllow || 0,
//         pf: data.pf || 0,
//         tds: data.tds || 0,
//         esi: data.esi || 0,
//         paymentFrequency: data.paymentFrequency || "monthly",
//       });
//     }
//   }, [data]);

//   const handleChange = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const formatCurrency = (value) => {
//     return value ? `₹${value.toLocaleString("en-IN")}` : "₹0";
//   };

//   if (loading) {
//     return (
//       <Card>
//         <Skeleton active paragraph={{ rows: 4 }} />
//       </Card>
//     );
//   }

//   if (!data) {
//     return (
//       <Card
//         title={
//           <div className="flex justify-between items-center">
//             <span className="flex items-center">
//               <DollarOutlined className="mr-2" />
//               Salary Details
//             </span>
//             <Button icon={<EditOutlined />} onClick={onEdit}>
//               Add Salary Details
//             </Button>
//           </div>
//         }
//       >
//         <Empty description="No salary details available" />
//       </Card>
//     );
//   }

//   return (
//     <Card
//       title={
//         <div className="flex justify-between items-center">
//           <span className="flex items-center">
//             <DollarOutlined className="mr-2" />
//             Salary Details
//           </span>
//           {!isEditing ? (
//             <Button icon={<EditOutlined />} onClick={onEdit} disabled={loading}>
//               Edit
//             </Button>
//           ) : (
//             <Space>
//               <Button onClick={onCancel}>Cancel</Button>
//               <Button type="primary" onClick={() => onSave(formData)}>
//                 Save
//               </Button>
//             </Space>
//           )}
//         </div>
//       }
//     >
//       {isEditing ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <EditableField
//             label="Basic Salary"
//             value={formData.basicSalary}
//             type="number"
//             onChange={(value) => handleChange("basicSalary", value)}
//           />
//           <EditableField
//             label="HRA"
//             value={formData.hra}
//             type="number"
//             onChange={(value) => handleChange("hra", value)}
//           />
//           <EditableField
//             label="DA"
//             value={formData.da}
//             type="number"
//             onChange={(value) => handleChange("da", value)}
//           />
//           <EditableField
//             label="Conveyance"
//             value={formData.conveyance}
//             type="number"
//             onChange={(value) => handleChange("conveyance", value)}
//           />
//           <EditableField
//             label="Medical"
//             value={formData.medical}
//             type="number"
//             onChange={(value) => handleChange("medical", value)}
//           />
//           <EditableField
//             label="Other Allowances"
//             value={formData.otherAllow}
//             type="number"
//             onChange={(value) => handleChange("otherAllow", value)}
//           />
//           <EditableField
//             label="PF"
//             value={formData.pf}
//             type="number"
//             onChange={(value) => handleChange("pf", value)}
//           />
//           <EditableField
//             label="TDS"
//             value={formData.tds}
//             type="number"
//             onChange={(value) => handleChange("tds", value)}
//           />
//           <EditableField
//             label="ESI"
//             value={formData.esi}
//             type="number"
//             onChange={(value) => handleChange("esi", value)}
//           />
//           <EditableField
//             label="Payment Frequency"
//             value={formData.paymentFrequency}
//             type="select"
//             options={[
//               { value: "monthly", label: "Monthly" },
//               { value: "weekly", label: "Weekly" },
//               { value: "bi-weekly", label: "Bi-Weekly" },
//             ]}
//             onChange={(value) => handleChange("paymentFrequency", value)}
//           />
//         </div>
//       ) : (
//         <div>
//           <Descriptions column={2}>
//             <Descriptions.Item label="Basic Salary">
//               {formatCurrency(data.basicSalary)}
//             </Descriptions.Item>
//             <Descriptions.Item label="HRA">
//               {formatCurrency(data.hra)}
//             </Descriptions.Item>
//             <Descriptions.Item label="DA">
//               {formatCurrency(data.da)}
//             </Descriptions.Item>
//             <Descriptions.Item label="Conveyance">
//               {formatCurrency(data.conveyance)}
//             </Descriptions.Item>
//             <Descriptions.Item label="Medical">
//               {formatCurrency(data.medical)}
//             </Descriptions.Item>
//             <Descriptions.Item label="Other Allowances">
//               {formatCurrency(data.otherAllow)}
//             </Descriptions.Item>
//             <Descriptions.Item label="PF">
//               {formatCurrency(data.pf)}
//             </Descriptions.Item>
//             <Descriptions.Item label="TDS">
//               {formatCurrency(data.tds)}
//             </Descriptions.Item>
//             <Descriptions.Item label="ESI">
//               {formatCurrency(data.esi)}
//             </Descriptions.Item>
//             <Descriptions.Item label="Payment Frequency">
//               {data.paymentFrequency
//                 ? data.paymentFrequency.charAt(0).toUpperCase() +
//                   data.paymentFrequency.slice(1)
//                 : "N/A"}
//             </Descriptions.Item>
//           </Descriptions>

//           <Divider />

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
//             <div className="bg-blue-50 p-4 rounded-lg">
//               <h4 className="font-semibold text-blue-700">Gross Salary</h4>
//               <p className="text-xl font-bold">
//                 {formatCurrency(data.grossSalary)}
//               </p>
//             </div>
//             <div className="bg-red-50 p-4 rounded-lg">
//               <h4 className="font-semibold text-red-700">Total Deductions</h4>
//               <p className="text-xl font-bold">
//                 {formatCurrency(data.totalDeductions)}
//               </p>
//             </div>
//             <div className="bg-green-50 p-4 rounded-lg">
//               <h4 className="font-semibold text-green-700">Net Salary</h4>
//               <p className="text-xl font-bold">
//                 {formatCurrency(data.netSalary)}
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </Card>
//   );
// };

const SalaryDetailsCard = ({
  data,
  loading,
  isEditing,
  onEdit,
  onCancel,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    basicSalary: 0,
    hra: 0,
    da: 0,
    conveyance: 0,
    medical: 0,
    otherAllow: 0,
    pf: 0,
    tds: 0,
    esi: 0,
    paymentFrequency: "monthly",
  });

  useEffect(() => {
    if (data) {
      setFormData({
        basicSalary: data.basicSalary || 0,
        hra: data.hra || 0,
        da: data.da || 0,
        conveyance: data.conveyance || 0,
        medical: data.medical || 0,
        otherAllow: data.otherAllow || 0,
        pf: data.pf || 0,
        tds: data.tds || 0,
        esi: data.esi || 0,
        paymentFrequency: data.paymentFrequency || "monthly",
      });
    }
  }, [data]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (value) => {
    return value ? `₹${value.toLocaleString("en-IN")}` : "₹0";
  };

  const calculateGrossSalary = () => {
    return (
      (formData.basicSalary || 0) +
      (formData.hra || 0) +
      (formData.da || 0) +
      (formData.conveyance || 0) +
      (formData.medical || 0) +
      (formData.otherAllow || 0)
    );
  };

  const calculateTotalDeductions = () => {
    return (formData.pf || 0) + (formData.tds || 0) + (formData.esi || 0);
  };

  const calculateNetSalary = () => {
    return calculateGrossSalary() - calculateTotalDeductions();
  };

  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <DollarOutlined className="mr-2" />
            Salary Details
          </span>
          {!isEditing ? (
            <Button
              icon={data ? <EditOutlined /> : <PlusOutlined />}
              onClick={onEdit}
              disabled={loading}
            >
              {data ? "Edit" : "Add Salary Details"}
            </Button>
          ) : (
            <Space>
              <Button onClick={onCancel}>Cancel</Button>
              <Button type="primary" onClick={() => onSave(formData)}>
                Save
              </Button>
            </Space>
          )}
        </div>
      }
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : isEditing ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Basic Salary
              </label>
              <InputNumber
                className="w-full"
                value={formData.basicSalary}
                onChange={(value) => handleChange("basicSalary", value)}
                min={0}
                formatter={(value) =>
                  `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                HRA
              </label>
              <InputNumber
                className="w-full"
                value={formData.hra}
                onChange={(value) => handleChange("hra", value)}
                min={0}
                formatter={(value) =>
                  `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                DA
              </label>
              <InputNumber
                className="w-full"
                value={formData.da}
                onChange={(value) => handleChange("da", value)}
                min={0}
                formatter={(value) =>
                  `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Conveyance
              </label>
              <InputNumber
                className="w-full"
                value={formData.conveyance}
                onChange={(value) => handleChange("conveyance", value)}
                min={0}
                formatter={(value) =>
                  `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Medical
              </label>
              <InputNumber
                className="w-full"
                value={formData.medical}
                onChange={(value) => handleChange("medical", value)}
                min={0}
                formatter={(value) =>
                  `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Other Allowances
              </label>
              <InputNumber
                className="w-full"
                value={formData.otherAllow}
                onChange={(value) => handleChange("otherAllow", value)}
                min={0}
                formatter={(value) =>
                  `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                PF
              </label>
              <InputNumber
                className="w-full"
                value={formData.pf}
                onChange={(value) => handleChange("pf", value)}
                min={0}
                formatter={(value) =>
                  `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                TDS
              </label>
              <InputNumber
                className="w-full"
                value={formData.tds}
                onChange={(value) => handleChange("tds", value)}
                min={0}
                formatter={(value) =>
                  `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                ESI
              </label>
              <InputNumber
                className="w-full"
                value={formData.esi}
                onChange={(value) => handleChange("esi", value)}
                min={0}
                formatter={(value) =>
                  `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Payment Frequency
              </label>
              <Select
                className="w-full"
                value={formData.paymentFrequency}
                onChange={(value) => handleChange("paymentFrequency", value)}
                options={[
                  { value: "monthly", label: "Monthly" },
                  { value: "weekly", label: "Weekly" },
                  { value: "bi-weekly", label: "Bi-Weekly" },
                ]}
              />
            </div>
          </div>

          <Divider />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-700">Gross Salary</h4>
              <p className="text-xl font-bold">
                {formatCurrency(calculateGrossSalary())}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-700">Total Deductions</h4>
              <p className="text-xl font-bold">
                {formatCurrency(calculateTotalDeductions())}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-700">Net Salary</h4>
              <p className="text-xl font-bold">
                {formatCurrency(calculateNetSalary())}
              </p>
            </div>
          </div>
        </div>
      ) : !data ? (
        <Empty description="No salary details available" />
      ) : (
        <div className="space-y-6">
          <Descriptions column={2}>
            {data.basicSalary !== undefined && (
              <Descriptions.Item label="Basic Salary">
                {formatCurrency(data.basicSalary)}
              </Descriptions.Item>
            )}

            {data.hra !== undefined && (
              <Descriptions.Item label="HRA">
                {formatCurrency(data.hra)}
              </Descriptions.Item>
            )}

            {data.da !== undefined && (
              <Descriptions.Item label="DA">
                {formatCurrency(data.da)}
              </Descriptions.Item>
            )}

            {data.conveyance !== undefined && (
              <Descriptions.Item label="Conveyance">
                {formatCurrency(data.conveyance)}
              </Descriptions.Item>
            )}

            {data.medical !== undefined && (
              <Descriptions.Item label="Medical">
                {formatCurrency(data.medical)}
              </Descriptions.Item>
            )}

            {data.otherAllow !== undefined && (
              <Descriptions.Item label="Other Allowances">
                {formatCurrency(data.otherAllow)}
              </Descriptions.Item>
            )}

            {data.pf !== undefined && (
              <Descriptions.Item label="PF">
                {formatCurrency(data.pf)}
              </Descriptions.Item>
            )}

            {data.tds !== undefined && (
              <Descriptions.Item label="TDS">
                {formatCurrency(data.tds)}
              </Descriptions.Item>
            )}

            {data.esi !== undefined && (
              <Descriptions.Item label="ESI">
                {formatCurrency(data.esi)}
              </Descriptions.Item>
            )}

            {data.paymentFrequency && (
              <Descriptions.Item label="Payment Frequency">
                {data.paymentFrequency.charAt(0).toUpperCase() +
                  data.paymentFrequency.slice(1)}
              </Descriptions.Item>
            )}
          </Descriptions>

          <Divider />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-700">Gross Salary</h4>
              <p className="text-xl font-bold">
                {formatCurrency(
                  (data.basicSalary || 0) +
                    (data.hra || 0) +
                    (data.da || 0) +
                    (data.conveyance || 0) +
                    (data.medical || 0) +
                    (data.otherAllow || 0)
                )}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-700">Total Deductions</h4>
              <p className="text-xl font-bold">
                {formatCurrency(
                  (data.pf || 0) + (data.tds || 0) + (data.esi || 0)
                )}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-700">Net Salary</h4>
              <p className="text-xl font-bold">
                {formatCurrency(
                  (data.basicSalary || 0) +
                    (data.hra || 0) +
                    (data.da || 0) +
                    (data.conveyance || 0) +
                    (data.medical || 0) +
                    (data.otherAllow || 0) -
                    ((data.pf || 0) + (data.tds || 0) + (data.esi || 0))
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};



const ExperienceCard = ({
  data,
  loading,
  isEditing,
  onEdit,
  onCancel,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    companyName: "",
    jobTitle: "",
    employmentType: "full-time",
    startDate: "",
    endDate: "",
    currentlyWorking: false,
    description: "",
  });

  const [experiences, setExperiences] = useState(data || []);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    if (data) {
      setExperiences(data);
    }
  }, [data]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddExperience = () => {
    setEditingIndex(null);
    setFormData({
      companyName: "",
      jobTitle: "",
      employmentType: "full-time",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      description: "",
    });
    onEdit();
  };

  const handleEditExperience = (index) => {
    setEditingIndex(index);
    setFormData({
      companyName: experiences[index].companyName || "",
      jobTitle: experiences[index].jobTitle || "",
      employmentType: experiences[index].employmentType || "full-time",
      startDate: experiences[index].startDate || "",
      endDate: experiences[index].endDate || "",
      currentlyWorking: experiences[index].currentlyWorking || false,
      description: experiences[index].description || "",
    });
    onEdit();
  };

  const handleSaveExperience = () => {
    const updatedExperiences = [...experiences];
    if (editingIndex !== null) {
      updatedExperiences[editingIndex] = formData;
    } else {
      updatedExperiences.push(formData);
    }
    setExperiences(updatedExperiences);
    onSave(updatedExperiences);
  };

  const handleRemoveExperience = async(index) => {
    // console.log(index,experiences )
    // const updatedExperiences = experiences.filter((_, i) => i !== index);
    // console.log(updatedExperiences)
    // setExperiences(updatedExperiences);
   
    // onSave(updatedExperiences);
 const exp=experiences[index]
try {
  if(!exp._id) return toast.error("Experience Not Found")
  await axiosInstance.delete(`/api/v1/deleteExp/${exp?._id}`)
onSave()
} catch (error) {
  
}




return
console.log(experiences[index])

const updatedExperiences = [...experiences];
    if (editingIndex !== null) {
      updatedExperiences[editingIndex] = formData;
    } else {
      updatedExperiences.push(formData);
    }
    setExperiences(updatedExperiences);
    onSave(updatedExperiences);





  };

  const calculateDuration = (startDate, endDate) => {
    if (!startDate) return "N/A";

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();

    const diffInMonths =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());

    const years = Math.floor(diffInMonths / 12);
    const months = diffInMonths % 12;

    return `${years} years ${months} months`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <ClockCircleOutlined className="mr-2" />
            Work Experience
          </span>
          {!isEditing && (
            <Button
              icon={<PlusOutlined />}
              onClick={handleAddExperience}
              disabled={loading}
            >
              Add Experience
            </Button>
          )}
        </div>
      }
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : isEditing ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Company Name
              </label>
              <Input
                value={formData.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Job Title
              </label>
              <Input
                value={formData.jobTitle}
                onChange={(e) => handleChange("jobTitle", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Employment Type
              </label>
              <Select
                className="w-full"
                value={formData.employmentType}
                onChange={(value) => handleChange("employmentType", value)}
                options={[
                  { value: "full-time", label: "Full Time" },
                  { value: "part-time", label: "Part Time" },
                  { value: "contract", label: "Contract" },
                  { value: "internship", label: "Internship" },
                ]}
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Start Date
              </label>
              <DatePicker
                className="w-full"
                value={formData.startDate ? dayjs(formData.startDate) : null}
                onChange={(date, dateString) =>
                  handleChange("startDate", dateString)
                }
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Currently Working
              </label>
              <Switch
                checked={formData.currentlyWorking}
                onChange={(checked) =>
                  handleChange("currentlyWorking", checked)
                }
                checkedChildren="Yes"
                unCheckedChildren="No"
              />
            </div>

            {!formData.currentlyWorking && (
              <div>
                <label className="block text-gray-600 text-sm font-medium mb-1">
                  End Date
                </label>
                <DatePicker
                  className="w-full"
                  value={formData.endDate ? dayjs(formData.endDate) : null}
                  onChange={(date, dateString) =>
                    handleChange("endDate", dateString)
                  }
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1">
              Description
            </label>
            <Input.TextArea
              rows={4}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" onClick={handleSaveExperience}>
              {editingIndex !== null ? "Update Experience" : "Add Experience"}
            </Button>
          </div>
        </div>
      ) : experiences && experiences.length > 0 ? (
        <div className="space-y-4">
          {experiences.map((exp, index) => (
            <Card
              key={index}
              className="relative hover:shadow-md transition-shadow"
            >
              <div className="absolute top-4 right-4 flex space-x-2">
              
              
                {/* //  <Button size="small"
                //  
                 //   icon={<EditOutlined />}
                 //  onClick={() => handleEditExperience(index)}
                //  > */}



                <Popconfirm
                  title="Are you sure to delete this experience?"
                  onConfirm={() => handleRemoveExperience(index)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button size="small" icon={<DeleteOutlined />} danger />
                </Popconfirm>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {exp.companyName || "N/A"}
                    </h3>
                    <p className="text-gray-600">{exp.jobTitle || "N/A"}</p>
                  </div>
                  <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {exp.employmentType
                      ? exp.employmentType.charAt(0).toUpperCase() +
                        exp.employmentType.slice(1)
                      : "N/A"}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p>{calculateDuration(exp.startDate, exp.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Period</p>
                    <p>
                      {formatDate(exp.startDate)} -{" "}
                      {exp.currentlyWorking
                        ? "Present"
                        : formatDate(exp.endDate)}
                    </p>
                  </div>
                </div>

                {exp.description && (
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="text-gray-700 whitespace-pre-line">
                      {exp.description}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Empty description="No work experience records found" />
      )}
    </Card>
  );
};

// const AssetCard = ({ data, loading, isEditing, onEdit, onCancel, onSave }) => {
//   const [formData, setFormData] = useState({
//     name: "",
//     price: "",
//     purchaseDate: "",
//     quantity: 1,
//   });

//   const [assets, setAssets] = useState(data || []);
//   const [editingIndex, setEditingIndex] = useState(null);

//   useEffect(() => {
//     if (data) {
//       setAssets(data);
//     }
//   }, [data]);

//   const handleChange = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleAddAsset = () => {
//     setEditingIndex(null);
//     setFormData({
//       name: "",
//       price: "",
//       purchaseDate: "",
//       quantity: 1,
//     });
//     onEdit();
//   };

//   const handleEditAsset = (index) => {
//     setEditingIndex(index);
//     setFormData({
//       name: assets[index].name || "",
//       price: assets[index].price || "",
//       purchaseDate: assets[index].purchaseDate || "",
//       quantity: assets[index].quantity || 1,
//     });
//     onEdit();
//   };

//   const handleSaveAsset = () => {
//     if (editingIndex !== null) {
//       // Update existing asset
//       const updatedAssets = [...assets];
//       updatedAssets[editingIndex] = formData;
//       setAssets(updatedAssets);
//     } else {
//       // Add new asset
//       setAssets((prev) => [...prev, formData]);
//     }
//     onSave(assets);
//   };

//   const handleRemoveAsset = (index) => {
//     const updatedAssets = assets.filter((_, i) => i !== index);
//     setAssets(updatedAssets);
//     onSave(updatedAssets);
//   };

//   if (loading) {
//     return (
//       <Card>
//         <Skeleton active paragraph={{ rows: 4 }} />
//       </Card>
//     );
//   }

//   return (
//     <Card
//       title={
//         <div className="flex justify-between items-center">
//           <span className="flex items-center">
//             <ShoppingOutlined className="mr-2" />
//             Assets
//           </span>
//           {!isEditing && (
//             <Button
//               icon={<PlusOutlined />}
//               onClick={handleAddAsset}
//               disabled={loading}
//             >
//               Add Asset
//             </Button>
//           )}
//         </div>
//       }
//     >
//       {isEditing ? (
//         <div className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <EditableField
//               label="Asset Name"
//               value={formData.name}
//               onChange={(value) => handleChange("name", value)}
//             />
//             <EditableField
//               label="Price"
//               value={formData.price}
//               type="number"
//               onChange={(value) => handleChange("price", value)}
//             />
//             <EditableField
//               label="Purchase Date"
//               value={formData.purchaseDate}
//               type="date"
//               onChange={(value) => handleChange("purchaseDate", value)}
//             />
//             <EditableField
//               label="Quantity"
//               value={formData.quantity}
//               type="number"
//               min={1}
//               onChange={(value) => handleChange("quantity", value)}
//             />
//           </div>

//           <div className="flex justify-end space-x-2 mt-4">
//             <Button onClick={onCancel}>Cancel</Button>
//             <Button type="primary" onClick={handleSaveAsset}>
//               {editingIndex !== null ? "Update Asset" : "Add Asset"}
//             </Button>
//           </div>
//         </div>
//       ) : assets && assets.length > 0 ? (
//         <div className="space-y-4">
//           {assets.map((asset, index) => (
//             <Card key={index} className="relative">
//               <div className="absolute top-4 right-4 flex space-x-2">
//                 <Button
//                   size="small"
//                   icon={<EditOutlined />}
//                   onClick={() => handleEditAsset(index)}
//                 />
//                 <Popconfirm
//                   title="Are you sure to delete this asset?"
//                   onConfirm={() => handleRemoveAsset(index)}
//                   okText="Yes"
//                   cancelText="No"
//                 >
//                   <Button size="small" icon={<DeleteOutlined />} danger />
//                 </Popconfirm>
//               </div>

//               <Descriptions column={2}>
//                 <Descriptions.Item label="Asset Name">
//                   {asset.name || "N/A"}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Price">
//                   {asset.price ? `₹${asset.price}` : "N/A"}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Purchase Date">
//                   {asset.purchaseDate
//                     ? format(new Date(asset.purchaseDate), "PPP")
//                     : "N/A"}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Quantity">
//                   {asset.quantity || "N/A"}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Total Value">
//                   {asset.price && asset.quantity
//                     ? `₹${asset.price * asset.quantity}`
//                     : "N/A"}
//                 </Descriptions.Item>
//               </Descriptions>
//             </Card>
//           ))}
//         </div>
//       ) : (
//         <Empty description="No asset records found" />
//       )}
//     </Card>
//   );
// };

const AssetCard = ({
  data,
  loading,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onVerify,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    purchaseDate: "",
    quantity: 1,
    verified: false,
  });

  const [assets, setAssets] = useState(data || []);
  const [editingIndex, setEditingIndex] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    if (data) {
      setAssets(data);
    }
  }, [data]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddAsset = () => {
    setEditingIndex(null);
    setFormData({
      name: "",
      price: "",
      purchaseDate: "",
      quantity: 1,
      verified: false,
    });
    onEdit();
  };

  const handleEditAsset = (index) => {
    setEditingIndex(index);
    setFormData({
      name: assets[index].name || "",
      price: assets[index].price || "",
      purchaseDate: assets[index].purchaseDate || "",
      quantity: assets[index].quantity || 1,
      verified: assets[index].verified || false,
    });
    onEdit();
  };

  const handleSaveAsset = () => {
    let updatedAssets;

    if (editingIndex !== null) {
      // Update existing asset
      updatedAssets = [...assets];
      updatedAssets[editingIndex] = formData;
    } else {
      // Add new asset
      updatedAssets = [...assets, formData];
    }

    setAssets(updatedAssets);
    onSave(updatedAssets);
    onCancel();
  };

  const handleRemoveAsset = async(index) => {
    // const updatedAssets = assets.filter((_, i) => i !== index);
    // setAssets(updatedAssets);
    // onSave(updatedAssets);


 const exp=assets[index]
 

 
try {
  if(!exp._id) return toast.error("Assets Not Found")
  await axiosInstance.delete(`/api/v1/deleteAsset/${exp?._id}`)
 onSave()
} catch (error) {
  
}




  };

  const handlePreview = (url) => {
    setPreviewImage(url);
    setPreviewVisible(true);
  };

  if (loading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    );
  }

  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <ShoppingOutlined className="mr-2 text-blue-500" />
            <span className="text-lg font-semibold">Assets</span>
          </span>
          {!isEditing && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddAsset}
              disabled={loading}
            >
              Add Asset
            </Button>
          )}
        </div>
      }
      className="shadow-lg"
    >
      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditableField
              label="Asset Name"
              value={formData.name}
              onChange={(value) => handleChange("name", value)}
              placeholder="Enter asset name"
            />
            <EditableField
              label="Price (₹)"
              value={formData.price}
              type="number"
              onChange={(value) => handleChange("price", value)}
              placeholder="Enter price"
            />
            <EditableField
              label="Purchase Date"
              value={formData.purchaseDate}
              type="date"
              onChange={(value) => handleChange("purchaseDate", value)}
            />
            <EditableField
              label="Quantity"
              value={formData.quantity}
              type="number"
              min={1}
              onChange={(value) => handleChange("quantity", value)}
            />
            <EditableField
              label="Verification"
              value={formData.verified}
              type="switch"
              checkedChildren="Verified"
              unCheckedChildren="Unverified"
              onChange={(value) => handleChange("verified", value)}
            />
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" onClick={handleSaveAsset}>
              {editingIndex !== null ? "Update Asset" : "Add Asset"}
            </Button>
          </div>
        </div>
      ) : assets && assets.length > 0 ? (
        <div className="space-y-6">
          {assets.map((asset, index) => (
            <Card
              key={index}
              className="relative border border-gray-100 hover:border-blue-100 transition-all"
              bodyStyle={{ padding: "16px" }}
            >
              <div className="absolute top-4 right-4 flex space-x-2">
                {/* <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEditAsset(index)}
                /> */}
                <Popconfirm
                  title="Are you sure to delete this asset?"
                  onConfirm={() => handleRemoveAsset(index)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button size="small" icon={<DeleteOutlined />} danger />
                </Popconfirm>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/4">
                  <div className="h-40 bg-gray-50 rounded-md flex items-center justify-center overflow-hidden border">
                    <ShoppingOutlined className="text-4xl text-gray-400" />
                  </div>
                </div>

                <div className="w-full md:w-3/4">
                  <Descriptions
                    column={1}
                    size="small"
                    className="asset-details"
                  >
                    <Descriptions.Item label="Asset Name">
                      <span className="font-medium">{asset.name || "N/A"}</span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Price">
                      <Tag color="blue" className="text-sm">
                        {asset.price ? `₹${asset.price}` : "N/A"}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Purchase Date">
                      {asset.purchaseDate
                        ? format(new Date(asset.purchaseDate), "PPP")
                        : "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Quantity">
                      {asset.quantity || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Total Value">
                      <Tag color="green" className="text-sm">
                        {asset.price && asset.quantity
                          ? `₹${asset.price * asset.quantity}`
                          : "N/A"}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Tag
                        color={asset.verified ? "green" : "orange"}
                        icon={
                          asset.verified ? <CheckOutlined /> : <CloseOutlined />
                        }
                      >
                        {asset.verified ? "Verified" : "Pending Verification"}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>

                  {onVerify && !asset.verified && (
                    <div className="mt-4">
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => onVerify(asset._id)}
                      >
                        Verify Asset
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Empty
          description={
            <span className="text-gray-500">No assets added yet</span>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={handleAddAsset}>
            Add Your First Asset
          </Button>
        </Empty>
      )}

      {previewVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-screen overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">Asset Preview</h3>
              <Button
                icon={<CloseOutlined />}
                type="text"
                onClick={() => setPreviewVisible(false)}
              />
            </div>
            <div className="p-4 flex justify-center">
              <ShoppingOutlined className="text-6xl text-gray-400" />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

const DocumentCard = ({
  data,
  loading,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onVerify,
}) => {
  const [formData, setFormData] = useState({
    documentType: "Aadhar Card",
    documentNumber: "",
    documentUrl: "",
    verified: false,
  });

  const [documents, setDocuments] = useState(data || []);
  const [editingIndex, setEditingIndex] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    if (data) {
      setDocuments(data);
    }
  }, [data]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddDocument = () => {
    setEditingIndex(null);
    setFormData({
      documentType: "Aadhar Card",
      documentNumber: "",
      documentUrl: "",
      verified: false,
    });
    onEdit();
  };

  const handleEditDocument = (index) => {
    setEditingIndex(index);
    setFormData({
      ...documents[index],
    });
    onEdit();
  };

  const handleSaveDocument = () => {
    let updatedDocuments;

    if (editingIndex !== null) {
      // Update existing document
      updatedDocuments = [...documents];
      updatedDocuments[editingIndex] = formData;
    } else {
      // Add new document
      updatedDocuments = [...documents, formData];
    }

    setDocuments(updatedDocuments);
    onSave(updatedDocuments);
    onCancel();
  };

  const handleRemoveDocument = async(index) => {
    // const updatedDocuments = documents.filter((_, i) => i !== index);
    // setDocuments(updatedDocuments);
    // onSave(updatedDocuments);



 const exp=documents[index]
 

 
try {
  if(!exp._id) return toast.error("documents Not Found")
  await axiosInstance.delete(`/api/v1/deleteDocs/${exp?._id}`)
 onSave()
} catch (error) {
  
}




  };

  const handlePreview = (url) => {
    setPreviewImage(url);
    setPreviewVisible(true);
  };

  const documentTypes = [
    "Aadhar Card",
    "PAN Card",
    "Passport",
    "Driving License",
    "Voter ID",
    "Ration Card",
    "Other",
  ];

  if (loading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    );
  }

  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <FileTextOutlined className="mr-2 text-blue-500" />
            <span className="text-lg font-semibold">Documents</span>
          </span>
          {!isEditing && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddDocument}
              disabled={loading}
            >
              Add Document
            </Button>
          )}
        </div>
      }
      className="shadow-lg"
    >
      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditableField
              label="Document Type"
              value={formData.documentType}
              type="select"
              options={documentTypes.map((type) => ({
                value: type,
                label: type,
              }))}
              onChange={(value) => handleChange("documentType", value)}
            />
            <EditableField
              label="Document Number"
              value={formData.documentNumber}
              onChange={(value) => handleChange("documentNumber", value)}
              placeholder="Enter document number"
            />

            <EditableField
              label="Verification"
              value={formData.verified}
              type="switch"
              checkedChildren="Verified"
              unCheckedChildren="Unverified"
              onChange={(value) => handleChange("verified", value)}
            />

            <EditableField
              label="Document URL"
              value={formData.documentUrl}
              onChange={(value) => handleChange("documentUrl", value)}
              placeholder="Paste document image URL"
              type="upload"
            />
          </div>

          {formData.documentUrl && (
            <div className="mt-4">
              <p className="font-medium mb-2">Document Preview:</p>
              <div className="w-48 h-32 border rounded-md overflow-hidden">
                <Avatar
                  shape="square"
                  src={formData.documentUrl}
                  alt="Document preview"
                  className="!w-full !h-full object-contain"
                  onClick={() => handlePreview(formData.documentUrl)}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 mt-6">
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" onClick={handleSaveDocument}>
              {editingIndex !== null ? "Update Document" : "Add Document"}
            </Button>
          </div>
        </div>
      ) : documents && documents.length > 0 ? (
        <div className="space-y-6">
          {documents.map((doc, index) => (
            <Card
              key={index}
              className="relative border border-gray-100 hover:border-blue-100 transition-all"
              bodyStyle={{ padding: "16px" }}
            >
              <div className="absolute top-4 right-4 flex space-x-2">
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEditDocument(index)}
                />
                <Popconfirm
                  title="Are you sure to delete this document?"
                  onConfirm={() => handleRemoveDocument(index)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button size="small" icon={<DeleteOutlined />} danger />
                </Popconfirm>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/4">
                  <div
                    className="h-40 bg-gray-50 rounded-md flex items-center justify-center cursor-pointer overflow-hidden border"
                    onClick={() => handlePreview(doc.documentUrl)}
                  >
                    {doc.documentUrl ? (
                      <Avatar
                        size={"large"}
                        shape="square"
                        src={doc.documentUrl}
                        alt="Document"
                        className="w-full h-full !w-full !h-full object-contain"
                      />
                    ) : (
                      <FileTextOutlined className="text-4xl text-gray-400" />
                    )}
                  </div>
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => handlePreview(doc.documentUrl)}
                    className="mt-2"
                  >
                    View Full
                  </Button>
                </div>

                <div className="w-full md:w-3/4">
                  <Descriptions
                    column={1}
                    size="small"
                    className="document-details"
                  >
                    <Descriptions.Item label="Document Type">
                      <span className="font-medium">
                        {doc.documentType || "N/A"}
                      </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Document Number">
                      <Tag color="blue" className="text-sm">
                        {doc.documentNumber || "N/A"}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Uploaded On">
                      {doc.createdAt
                        ? format(new Date(doc.createdAt), "PPP")
                        : "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Tag
                        color={doc.verified ? "green" : "orange"}
                        icon={
                          doc.verified ? <CheckOutlined /> : <CloseOutlined />
                        }
                      >
                        {doc.verified ? "Verified" : "Pending Verification"}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>

                  {onVerify && !doc.verified && (
                    <div className="mt-4">
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => onVerify(doc._id)}
                      >
                        Verify Document
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Empty
          description={
            <span className="text-gray-500">No documents added yet</span>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={handleAddDocument}>
            Add Your First Document
          </Button>
        </Empty>
      )}

      {previewVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-screen overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">Document Preview</h3>
              <Button
                icon={<CloseOutlined />}
                type="text"
                onClick={() => setPreviewVisible(false)}
              />
            </div>
            <div className="p-4 flex justify-center">
              <Avatar
                shape="square"
                src={previewImage}
                alt="Document preview"
                className="!w-full !h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

const EditableField = ({
  label,
  value,
  type = "text",
  options,
  onChange,
  ...props
}) => {
  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  const handleSwitchChange = (checked) => {
    onChange(checked);
  };

  const handleSelectChange = (value) => {
    onChange(value);
  };

  const handleDateChange = (date, dateString) => {
    onChange(dateString);
  };

  return (
    <div className="mb-4">
      <label className="block text-gray-600 text-sm font-medium mb-1">
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={value}
          onChange={handleInputChange}
          rows={3}
        />
      ) : type === "switch" ? (
        <div>
          <Switch checked={value} onChange={handleSwitchChange} {...props} />
        </div>
      ) : type === "select" ? (
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={value}
          onChange={(e) => handleSelectChange(e.target.value)}
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "date" ? (
        <DatePicker
          className="w-full"
          value={value ? dayjs(value) : null}
          onChange={handleDateChange}
        />
      ) : (
        <input
          type={type}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={value}
          onChange={handleInputChange}
          {...props}
        />
      )}
    </div>
  );
};

export default ViewStaff;
