// import { Layout } from "antd";
// import LeftMenu from "../Tab/LeftMenu";
// import { Outlet } from "react-router-dom";

// import TopHeader from "../components/layouts/TopHeader";

 

// function Home() {
//   console.log("home")
//   return (
//     <Layout className="h-screen overflow-hidden">
//       <LeftMenu />
//       <Layout>
//         <div className="h-screen backdrop-invert-0 overflow-hidden">
//           <TopHeader />

//           <Outlet />
//         </div>
//       </Layout>
//     </Layout>
//   );
// }

// export default Home;


import { Layout } from "antd";
import LeftMenu from "../Tab/LeftMenu";
import { Outlet } from "react-router-dom";
import TopHeader from "../components/layouts/TopHeader";
import { useState, useEffect } from "react";

const { Content } = Layout;

function Home() {
    const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setMobileDrawerVisible(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        if (isMobile) {
            setMobileDrawerVisible(!mobileDrawerVisible);
        } else {
            setCollapsed(!collapsed);
        }
    };

    return (
        <Layout className="h-screen overflow-hidden">
            <LeftMenu 
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                mobileDrawerVisible={mobileDrawerVisible}
                setMobileDrawerVisible={setMobileDrawerVisible}
                isMobile={isMobile}
                toggleSidebar={toggleSidebar}
            />
            <Layout>
                <div className="h-screen backdrop-invert-0 overflow-hidden">
                    <TopHeader 
                        toggleSidebar={toggleSidebar}
                        isMobile={isMobile}
                        collapsed={collapsed}
                    />
                    <Outlet />
                </div>
            </Layout>
        </Layout>
    );
}

export default Home;