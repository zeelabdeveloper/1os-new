 

import { Layout, Button, Dropdown, Avatar, Space, Badge, Modal } from "antd";
import {

  QuestionCircleOutlined,
  
  UserOutlined,
  DownOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import { FiLogOut } from "react-icons/fi";
import { FullLogo } from "../../locale/local";
import useAuthStore from "../../stores/authStore";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Notification from "../../Tab/Notification";

const { Header } = Layout;

const TopHeader = ({ toggleSidebar, isMobile, collapsed }) => {
  const { user, logout } = useAuthStore((state) => state);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleMenuClick = (e) => {
    if (e.key === "1") {
      navigate("/profiles");
    } else if (e.key === "3") {
      setIsLogoutModalOpen(true);
    }
  };

  const handleLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
    navigate("/login");
  };

  const menuItems = [
    {
      key: "1",
      label: "Profile",
      icon: <UserOutlined />,
    },
    { type: "divider" },
    {
      key: "3",
      label: "Logout",
      icon: <FiLogOut className="mr-2" />,
      danger: true,
    },
  ];

  return (
    <>
      <Header className="flex items-center justify-between !px-1 !h-[8vh] !bg-white shadow-2xl">
        <div style={{ display: "flex", justifyContent: "center", alignItems:'center', flexShrink: 0 }}>
          <Button
            type="text"
            icon={isMobile ? <MenuUnfoldOutlined /> : 
                  (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
            onClick={toggleSidebar}
            style={{ width: 40, height: 40 }}
          />
          
          <img
            src={FullLogo}
            alt="Logo"
            style={{ maxWidth: "100px", height: "30px" }}
          />
        </div>

        <div className="flex items-center space-x-4">
          <Notification userId={user._id} />
          <Button
            type="text"
            onClick={() => navigate("/faq")}
            icon={<QuestionCircleOutlined className="text-gray-500" />}
            className="mx-5 hidden sm:flex"
          />

          <Dropdown
            menu={{
              items: menuItems,
              onClick: handleMenuClick,
            }}
            placement="bottomRight"
          >
            <Space className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
              <Avatar src={user?.avatar} icon={<UserOutlined />} />
              <div className="hidden md:block">
                <p className="text-sm font-medium">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <DownOutlined className="text-xs text-gray-500" />
            </Space>
          </Dropdown>
        </div>
      </Header>

      <Modal
        title="Confirm Logout"
        open={isLogoutModalOpen}
        onOk={handleLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
        okText="Logout"
        okButtonProps={{
          danger: true,
          icon: <FiLogOut className="mr-1" />,
        }}
        cancelButtonProps={{
          type: "text",
        }}
      >
        <div className="flex items-center">
          <FiLogOut className="text-lg mr-3 text-gray-600" />
          <p>Are you sure you want to logout?</p>
        </div>
      </Modal>
    </>
  );
};

export default TopHeader;