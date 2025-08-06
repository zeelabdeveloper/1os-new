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
          <SingleBranchAnalytics branchId="685a45cfac371d35857d3acf" />
          <UserManagementCoco branchId="685a45cfac371d35857d3acf" />
        </div>
      ),
    },

    {
      key: "regularization",
      label: "Regularization",
      children: <AdminRegularizationList  branchId="685a45cfac371d35857d3acf"  />,
    },
    {
      key: "attendance",
      label: "Attendance",
      children: <Attendance   branchId="685a45cfac371d35857d3acf"   />,
    },
    {
      key: "store",
      label: "Store",
      children: <Store />,
    },
  ];

  return (
    <div className="p-2 h-[92vh] overflow-y-auto ">
      <h1 className="text-2xl font-bold mb-4">COCO - Managment</h1>
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
