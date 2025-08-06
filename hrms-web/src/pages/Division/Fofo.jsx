import React, { useState } from "react";
import { Tabs } from "antd";
import UserManagementCoco from "../Coco/UserList";
import AdminRegularizationList from "../Coco/RequestList";
import Store from "../Coco/Store";
import Attendance from "../Coco/Attendance";
import SingleBranchAnalytics from "../../components/dashboard/SingleBranchAnalyitcs";
 

function Coco() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      children: (
        <div>
          <SingleBranchAnalytics branchId="68721bb7f9536c0e2dcd0fd1" />
          <UserManagementCoco branchId="68721bb7f9536c0e2dcd0fd1" />
        </div>
      ),
    },

    {
      key: "regularization",
      label: "Regularization",
      children: <AdminRegularizationList  branchId="68721bb7f9536c0e2dcd0fd1"  />,
    },
    {
      key: "attendance",
      label: "Attendance",
      children: <Attendance   branchId="68721bb7f9536c0e2dcd0fd1"   />,
    },
    {
      key: "store",
      label: "Store",
      children: <Store />,
    },
  ];

  return (
    <div className="p-2 h-[92vh] overflow-y-auto ">
      <h1 className="text-2xl font-bold mb-4">Fofo-Management</h1>
      <div className="bg-white rounded-lg shadow">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="p-4"
        />
      </div>
    </div>
  );
}

export default Coco;
