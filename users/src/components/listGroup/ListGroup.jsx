import "./listGroup.scss";
import {
  Box,
  Button,
  Typography,
  Modal,
  TextField,
  Autocomplete,
  Stack,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import { ChatContext } from "../../context/chatContext";
import { io } from "socket.io-client";

const ListGroup = () => {
  const { currentUser } = useContext(AuthContext);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [options, setOptions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [invitedMembers, setInvitedMembers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  const { data, dispatch } = useContext(ChatContext);

  const handleInputChange = async (event, value, reason) => {
    if (reason === "input") {
      try {
        const response = await makeRequest.post("/search", { username: value });
        console.log("API /search response:", response.data);

        // Lọc ra những người chưa được chọn
        const filteredOptions = response.data.filter(
          (option) =>
            !selectedMembers.some((selected) => selected.id === option.id)
        );

        setOptions(filteredOptions);
      } catch (error) {
        console.error("Error searching for user:", error);
      }
    }
  };

  const handleUserSelect = (event, value) => {
    setInvitedMembers(value);
    // Thêm người dùng đã chọn vào danh sách đã chọn
    setSelectedMembers(value);
  };

  const handleOk = async () => {
    if (!groupName || invitedMembers.length === 0) {
      alert("Tên nhóm và thành viên là bắt buộc");
      return;
    }

    try {
      console.log("invitedMembers:", invitedMembers);

      const invitedMemberIds = invitedMembers.map((member) => member.id);

      const membersWithAdmin = [...invitedMemberIds, currentUser.user.id];

      const response = await makeRequest.post("/groups/group", {
        groupName: groupName,
        members: membersWithAdmin,
        admin: currentUser.user.id,
      });

      // Emit the new group event to the server
      const socket = io("http://localhost:8800");
      socket.emit("newGroup", response.data);

      // Cập nhật danh sách người dùng đã chọn để tránh sự trùng lặp
      setSelectedMembers([]);

      setGroups((prevGroups) => [...prevGroups, response.data]);
      setGroupName("");
      setInvitedMembers([]);
      handleClose();
    } catch (error) {
      console.error("Lỗi khi tạo nhóm:", error.message);
    }
  };

  useEffect(() => {
    const socket = io("http://localhost:8800");

    socket.on("newGroup", (newGroup) => {
      setGroups((prevGroups) => [...prevGroups, newGroup]);
    });

    socket.on("groupDeleted", (data) => {
      console.log("Group deleted:", data);
      // Update the list of groups
      setGroups((prevGroups) =>
        prevGroups.filter((group) => group.id !== data.groupId)
      );
    });

    return () => {
      socket.off("newGroup");
      socket.off("groupDeleted");
    };
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await makeRequest.post(
          `/groups/listGroups/${data.groupId.id}`,
          {
            userId: currentUser.user.id,
          }
        );
        console.log("API /chats/listGroups respsonse:", response.data);
        console.log("data.groupId.id:", data.groupId.id);
        console.log("data.groupId:", data.groupId);
        setGroups(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách nhóm:", error.message);
      }
    };

    fetchGroups();
  }, [currentUser.user.id, data.groupId]);

  const style = {
    position: "absolute",
    top: "40%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #0000",
    borderRadius: "20px",
    boxShadow: 24,
    p: 4,
  };

  const handleGroupChatClick = (groupChat) => {
    console.log("groupChat:", groupChat);
    dispatch({ type: "CHANGE_GROUP_CHAT", payload: groupChat });
  };

  return (
    <div className="listGroup">
      <div className="addGroup">
        <Button onClick={handleOpen}>
          <p>Tạo nhóm</p>
        </Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography
              id="modal-modal-title"
              variant="h6"
              component="h2"
              style={{ marginBottom: "10px" }}
            >
              Tạo nhóm
            </Typography>
            <TextField
              label="Tên nhóm"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              style={{ marginBottom: "15px" }}
            />
            <Stack spacing={3}>
              <Autocomplete
                freeSolo
                disableClearable
                filterSelectedOptions
                multiple
                value={invitedMembers}
                options={options}
                onInputChange={handleInputChange}
                onChange={handleUserSelect}
                getOptionLabel={(option) => option.displayName}
                isOptionEqualToValue={(option, value) =>
                  option.displayName === value.displayName
                }
                renderOption={(props, option) => (
                  <Box
                    component="li"
                    {...props}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <img
                        src={option.profilePic}
                        alt={option.displayName}
                        style={{
                          width: "30px",
                          height: "30px",
                          marginRight: "10px",
                        }}
                      />
                      {option.displayName}
                    </div>
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Mời thành viên"
                    style={{ marginBottom: "10px" }}
                  />
                )}
              />
            </Stack>
            <Button onClick={handleOk}>OK</Button>
            <Button onClick={handleClose}>Cancel</Button>
          </Box>
        </Modal>
      </div>

      {groups.map((group, index) => (
        <div
          className="groupChat"
          key={index}
          onClick={() => handleGroupChatClick(group)}
        >
          {/* <img
            src="https://didongviet.vn/dchannel/wp-content/uploads/2023/08/hinh-nen-3d-hinh-nen-iphone-dep-3d-didongviet@2x-576x1024.jpg"
            alt=""
          /> */}
          <div className="groupChatInfo">
            <span>{group.groupName}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListGroup;
