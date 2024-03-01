import { useCallback, useContext, useEffect, useState } from "react";
import "./infoGroup.scss";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Button, Typography, Modal } from "@mui/material";
import { ChatContext } from "../../context/chatContext";
import { makeRequest } from "../../axios";
import { io } from "socket.io-client";
import { AuthContext } from "../../context/authContext";

const InfoGroup = () => {
  const [openGroup, setOpenGroup] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const handleOpenGroup = () => setOpenGroup(true);
  const handleCloseGroup = () => setOpenGroup(false);
  const handleOpenUser = (member) => {
    console.log("Member:", member.id);
    setSelectedMember({
      id: member.id, // Chỉ lấy id của thành viên
    });
    setOpenUser(true);
  };
  const handleCloseUser = () => setOpenUser(false);
  const { data, dispatch } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext);
  const [selectedMember, setSelectedMember] = useState(null);
  const [members, setMembers] = useState([]);
  

  const fetchMembers = useCallback(async () => {
    // Kiểm tra xem data.groupId có tồn tại không
    if (!data.groupId) {
      return;
    }
    try {
      const response = await makeRequest.get(
        `/groups/members/${data.groupId.id}`
      );
      const membersArray = Object.entries(response.data).map(([id, data]) => ({
        id,
        ...data,
      }));

      console.log("Members array:", membersArray);

      setMembers(membersArray);
    } catch (error) {
      console.error("Error fetching members:", error.message);
    }
  }, [data.groupId]);

  useEffect(() => {
    fetchMembers();
  }, [data.groupId.id, fetchMembers]);

  useEffect(() => {
    const socket = io("http://localhost:8800");

    socket.on("memberAdded", (data) => {
      // Handle the new member data
      console.log("New member added:", data);
      fetchMembers();
    });

    socket.on("memberDeleted", (data) => {
      // Handle the deleted member data
      console.log("Member deleted:", data);
      fetchMembers();
    });

    socket.on("newGroup", () => {
      // Handle the new group event
      fetchMembers();
    });

    return () => {
      socket.off("memberAdded");
      socket.off("memberDeleted");
      socket.off("newGroup");
    };
  }, [fetchMembers]);

  const deleteMember = async (memberId) => {
    console.log("Deleting member with ID:", memberId); // Lấy trực tiếp id từ memberId
    try {
      const response = await makeRequest.post(
        `/groups/deleteMember/${data.groupId.id}`,
        { memberId, adminId: currentUser.user.id } // Gửi chỉ id của thành viên
      );
      console.log("Delete member response:", response.data);
      fetchMembers();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteGroup = async () => {
    try {
      const response = await makeRequest.delete(
        `/groups/deleteGroup/${data.groupId.id}`
      );
      console.log("Delete group response:", response.data);

      const groupId = data.groupId.id;
      const socket = io("http://localhost:8800");
      socket.emit("groupDeleted", { groupId });
      fetchMembers();
      dispatch({ type: "DELETE_GROUP" });
    } catch (error) {
      console.error(error);
    }
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #0000",
    borderRadius: "20px",
    boxShadow: 24,
    p: 4,
  };

  return (
    <div className="infoGroup">
      <div className="navGroup">
        <span className="title">Danh sách thành viên</span>
      </div>
      <div className="listUser">
        {members.map((member, index) => (
          <div className="userItem" key={index}>
            <div className="leftContainer">
              <img src={member.profilePic} alt="" />
              <div className="userInfo">
                <span>
                  {member.id === data.groupId.admin
                    ? `${member.displayName} (Trưởng nhóm)`
                    : member.displayName}
                </span>
              </div>
            </div>
            {currentUser.user.id === data.groupId.admin &&
              member.id !== data.groupId.admin && (
                <div className="item">
                  <DeleteIcon onClick={() => handleOpenUser(member)} />
                  <Modal
                    open={openUser}
                    onClose={handleCloseUser}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                  >
                    <Box sx={style}>
                      <Typography
                        id="modal-modal-title"
                        variant="h6"
                        component="h2"
                        style={{ marginBottom: "30px" }}
                      >
                        Bạn có chắc chắn muốn xóa thành viên này khỏi nhóm?
                      </Typography>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Button
                          style={{ marginLeft: "40px" }}
                          onClick={() => {
                            handleCloseUser();
                            if (selectedMember) {
                              const memberId = selectedMember.id;
                              console.log("Member ID from button:", memberId);
                              deleteMember(memberId);
                            }
                          }}
                        >
                          Xóa
                        </Button>

                        <Button
                          style={{ marginRight: "40px" }}
                          onClick={handleCloseUser}
                        >
                          Cancel
                        </Button>
                      </div>
                    </Box>
                  </Modal>
                </div>
              )}
          </div>
        ))}
      </div>

      {currentUser.user.id === data.groupId.admin && (
        <div className="deleteGroup">
          <Button onClick={handleOpenGroup}>Xóa nhóm</Button>
          <Modal
            open={openGroup}
            onClose={handleCloseGroup}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <Typography
                id="modal-modal-title"
                variant="h6"
                component="h2"
                style={{ marginBottom: "30px" }}
              >
                Bạn có chắc chắn muốn xóa nhóm này?
              </Typography>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Button
                  style={{ marginLeft: "40px" }}
                  onClick={() => {
                    handleCloseGroup();
                    deleteGroup();
                  }}
                >
                  Xóa
                </Button>
                <Button
                  style={{ marginRight: "40px" }}
                  onClick={handleCloseGroup}
                >
                  Cancel
                </Button>
              </div>
            </Box>
          </Modal>
        </div>
      )}
    </div>
  );
};

export default InfoGroup;
