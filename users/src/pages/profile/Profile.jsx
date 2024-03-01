import "./profile.scss";
import FacebookTwoToneIcon from "@mui/icons-material/FacebookTwoTone";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import PinterestIcon from "@mui/icons-material/Pinterest";
import TwitterIcon from "@mui/icons-material/Twitter";
import PlaceIcon from "@mui/icons-material/Place";
import LanguageIcon from "@mui/icons-material/Language";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import KeyIcon from "@mui/icons-material/Key";
import Posts from "../../components/posts/Posts";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Update from "../../components/update/Update";
import Change from "../../components/Change/Change";

const Profile = () => {
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openChange, setOpenChange] = useState(false);
  const userId = useLocation().pathname.split("/")[2];

  const { isPending, error, data } = useQuery({
    queryKey: ["user", userId],
    queryFn: () =>
      makeRequest.get(`/users/find/${userId}`).then((res) => res.data),
  });

  useEffect(() => {
    if (data) {
      console.log(data);
      console.log("openUpdate", openUpdate);
    }
  }, [data, openUpdate]);

  if (isPending) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  const handleUpdateClick = () => {
    setOpenUpdate(true);
  };

  const handleChangeClick = () => {
    setOpenChange(true);
  };

  return (
    <div className="profile">
      <div className="images">
        <img src={data.coverPic} alt="" className="cover" />
        <img src={data.profilePic} alt="" className="profilePic" />
      </div>
      <div className="profileContainer">
        <div className="uInfo">
          <div className="left">
            <a href="http://facebook.com">
              <FacebookTwoToneIcon fontSize="medium" />
            </a>
            <a href="http://facebook.com">
              <InstagramIcon fontSize="medium" />
            </a>
            <a href="http://facebook.com">
              <TwitterIcon fontSize="medium" />
            </a>
            <a href="http://facebook.com">
              <LinkedInIcon fontSize="medium" />
            </a>
            <a href="http://facebook.com">
              <PinterestIcon fontSize="medium" />
            </a>
          </div>
          <div className="center">
            <span>{data.displayName}</span>
            <div className="info">
              <div className="item">
                <PlaceIcon />
                <span>{data.city}</span>
              </div>
              <div className="item">
                <LanguageIcon />
                <span>{data.website}</span>
              </div>
            </div>
            <button onClick={handleUpdateClick}>Update</button>
          </div>
          <div className="right">
            <KeyIcon onClick={handleChangeClick} />
            <EmailOutlinedIcon />
            <MoreVertIcon />
          </div>
        </div>
        <Posts userId={userId} />
      </div>
      {openUpdate && <Update setOpenUpdate={setOpenUpdate} user={data} />}
      {openChange && <Change setOpenChange={setOpenChange} user={data} />}
    </div>
  );
};

export default Profile;
