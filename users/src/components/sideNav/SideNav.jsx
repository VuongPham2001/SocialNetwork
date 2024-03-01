import React from "react";
import "./sideNav.scss";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";

const SideNav = () => {
  return (
    <div className="sidenav">
      <span className="logo">Đoạn chat</span>
      <div className="item">
        <MoreHorizOutlinedIcon />
      </div>
    </div>
  );
};

export default SideNav;
