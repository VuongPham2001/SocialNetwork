import React from "react";
import SideNav from "../sideNav/SideNav";
import Search from "../search/Search";
import "./sideBar.scss";

const SideBar = () => {
  return (
    <div className="sidebar">
      <SideNav />
      <Search />
    </div>
  );
};

export default SideBar;
