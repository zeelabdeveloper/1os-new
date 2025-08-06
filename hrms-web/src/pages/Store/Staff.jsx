import React, { useState, useCallback, memo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  UserOutlined,
  IdcardOutlined,
  BankOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { Steps, Button, Form, Switch } from "antd";
import toast from "react-hot-toast";

// Import your components
import ConfirmationStaffCreate from "../Staff/ProfileCreating/Confirmation";
import SalaryDetails from "../Staff/ProfileCreating/SalaryDetails";
import ProfileInfo from "../Staff/ProfileCreating/ProfileInfo";
import BankDetails from "../Staff/ProfileCreating/BankDetails";
import WorkExperience from "../Staff/ProfileCreating/WorkExperience";
import CreateBasicInfo from "../Staff/ProfileCreating/BasicInfo";
import {
  createStaff,
  fetchBranches,
  fetchDepartmentsByBranch,
  fetchEmployees,
  fetchRoleByDepartment,
} from "../../api/auth";

const { Step } = Steps;

const UserCreationWizard = () => {
  const [current, setCurrent] = useState(0);
  const [isCocoStaff, setIsCocoStaff] = useState(true);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // State for branch and department selection
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  // Fetch manager

  // Fetch branches
  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
  });
  const { data: reporting } = useQuery({
    queryKey: ["reporting"],
    queryFn: () => fetchEmployees(isCocoStaff),
  });

  // Fetch departments based on selected branch
  const { data: departments } = useQuery({
    queryKey: ["departments", selectedBranch],
    queryFn: () => fetchDepartmentsByBranch(selectedBranch),
    enabled: !!selectedBranch,
  });

  // Fetch roles based on selected department
  const { data: roles } = useQuery({
    queryKey: ["roles", selectedDepartment],
    queryFn: () => fetchRoleByDepartment(selectedDepartment),
    enabled: !!selectedDepartment ,
  });

  // Mutation for creating user
  const { mutate: createUser, isLoading } = useMutation({
    mutationFn: createStaff,
    onSuccess: (data) => {
      toast.success(data.message || "User created successfully!");
      queryClient.invalidateQueries(["users"]);
      form.resetFields();
      setCurrent(0);
      setIsCocoStaff(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create user");
    },
  });

  // Wizard steps configuration
  const steps = [
    {
      title: "Basic Info",
      icon: <UserOutlined />,
      content: (
        <CreateBasicInfo
          form={form}
          isCocoStaff={isCocoStaff}
          branches={branches}
          departments={departments}
          roles={roles}
          managers={reporting}
          selectedBranch={selectedBranch}
          selectedDepartment={selectedDepartment}
          setSelectedBranch={setSelectedBranch}
          setSelectedDepartment={setSelectedDepartment}
        />
      ),
    },
    {
      title: "Profile",
      icon: <IdcardOutlined />,
      content: <ProfileInfo form={form} />,
    },
    {
      title: "Bank Details",
      icon: <BankOutlined />,
      content: <BankDetails form={form} />,
    },
    {
      title: "Experience",
      icon: <HistoryOutlined />,
      content: <WorkExperience form={form} />,
    },
    {
      title: "Salary",
      icon: <DollarOutlined />,
      content: <SalaryDetails form={form} />,
    },
    {
      title: "Confirmation",
      icon: <CheckCircleOutlined />,
      content: <ConfirmationStaffCreate form={form.getFieldsValue()} />,
    },
  ];

  const next = useCallback(() => {
    form
      .validateFields()
      .then(() => {
        const values = form.getFieldsValue();
        if (values.organization?.branch) {
          setSelectedBranch(values.organization.branch);
        }
        if (values.organization?.department) {
          setSelectedDepartment(values.organization.department);
        }
        setCurrent(current + 1);
      })
      .catch((error) => {
        console.error("Validation failed:", error);
        toast.error("Please fill all required fields correctly");
      });
  }, [form, current]);

  const prev = useCallback(() => {
    setCurrent(current - 1);
  }, [current]);

  const handleSubmit = useCallback(() => {
    form
      .validateFields()
      .then((values) => {
        createUser(form.getFieldValue());
      })
      .catch((error) => {
        console.error("Validation failed:", error);
        toast.error("Please fill all required fields correctly");
      });
  }, [form, createUser, isCocoStaff]);

  const handleCocoToggle = (checked) => {
    setIsCocoStaff(checked);
    form.setFieldsValue({
      organization: {
        branch: null,
        department: null,
        role: null,
      },
    });
    setSelectedBranch(null);
    setSelectedDepartment(null);
  };

  return (
    <div className="h-[92vh] overflow-y-auto p-10 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">New Staff Entry</h2>
        <div className="flex hidden items-center">
          <span className="mr-2">COCO Staff</span>
          <Switch
            className="hidden"
            checked={isCocoStaff}
            onChange={handleCocoToggle}
            checkedChildren="Yes"
            unCheckedChildren="No"
          />
        </div>
      </div>

      <Steps current={current} className="mb-8">
        {steps.map((item) => (
          <Step key={item.title} title={item.title} icon={item.icon} />
        ))}
      </Steps>

      <Form
        form={form}
        layout="vertical"
        onFinish={current === steps.length - 1 ? handleSubmit : next}
        initialValues={{ experiences: [] }}
      >
        <div className="min-h-64">{steps[current].content}</div>
        <div className="mt-8 flex justify-between">
          {current > 0 && (
            <Button onClick={prev} className="mr-2">
              Previous
            </Button>
          )}
          {current < steps.length - 1 ? (
            <Button type="primary" onClick={next}>
              Next
            </Button>
          ) : (
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Submit
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
};

export default memo(UserCreationWizard);
