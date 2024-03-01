import { useContext, useState, useEffect } from "react";
import Messages from "../messages/Messages";
import Input from "../input/Input";
import "./conversations.scss";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import VideocamIcon from "@mui/icons-material/Videocam";
import CallIcon from "@mui/icons-material/Call";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  Typography,
  Modal,
  Autocomplete,
  Stack,
  TextField,
} from "@mui/material";
import { ChatContext } from "../../context/chatContext";
import { makeRequest } from "../../axios";
import { io } from "socket.io-client";

const Conversations = ({ onMoreIconClick }) => {
  const { data, dispatch } = useContext(ChatContext);
  console.log("Deleting chat with ID:", data.chatId);
  // console.log("Data in Conversations:", data);
  // console.log("Data from Conversations dataUser:", data.user);
  // console.log("Data from Conversations dataGroupId:", data.groupId);
  const [open, setOpen] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const [options, setOptions] = useState([]);
  const [invitedMembers, setInvitedMembers] = useState([]);
  const [autocompleteValue, setAutocompleteValue] = useState([]);
  const handleOpenChat = () => setOpenChat(true);
  const handleCloseChat = () => setOpenChat(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSearch = async (event, value, reason) => {
    if (reason === "input") {
      try {
        const response = await makeRequest.post("/search", { username: value });
        console.log("API /search response:", response.data);

        // Lọc ra những người chưa ở trong nhóm
        const filteredOptions = response.data.filter((option) => {
          // Kiểm tra xem option.id có trong members của groupId không
          const isMember =
            data.groupId?.members && data.groupId.members[option.id];
          return !isMember;
        });

        setOptions(filteredOptions);
      } catch (error) {
        console.error("Error searching for user:", error);
      }
    }
  };

  const handleUserSelect = (event, value) => {
    setInvitedMembers(value);
    setAutocompleteValue(value);
  };

  const handleAddMember = async (member) => {
    try {
      const invitedMemberIds = invitedMembers.map((member) => member.id);
      const invitedMemberIdsString = invitedMemberIds.join(",");
      const response = await makeRequest.post(
        `/groups/addMember/${data.groupId.id}`,
        {
          memberId: invitedMemberIdsString,
        }
      );

      setOptions([]);
      setAutocompleteValue([]);
      setInvitedMembers([]);
      handleClose();
      console.log("API /addMember response:", response.data);
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const deleteChat = async () => {
    try {
      const response = await makeRequest.delete(
        `/chats/deleteChat/${data.chatId}`
      );
      console.log("Delete chat response:", response.data);

      const chatId = data.chatId;
      const socket = io("http://localhost:8800");

      // Thông báo cho server về việc xóa chat
      socket.emit("chatDeleted", { chatId });

      // Dispatch action để cập nhật state
      dispatch({ type: "DELETE_GROUP" });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const socket = io("http://localhost:8800");

    socket.on("groupDeleted", (data) => {
      dispatch({ type: "DELETE_GROUP" });
      onMoreIconClick();
    });

    return () => {
      socket.off("groupDeleted");
    };
  }, [dispatch, onMoreIconClick]);

  const style = {
    position: "absolute",
    top: "40%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    borderRadius: "20px",
    border: "2px solid #0000",
    boxShadow: 24,
    p: 4,
  };

  return (
    <div className="conversations">
      <div className="converInfo">
        {data.groupId !== "null" ? (
          <>
            {/* <img src={data.groupId?.groupImage} alt="" /> */}
            <span>{data.groupId?.groupName}</span>
          </>
        ) : (
          <>
            <img src={data.user?.profilePic} alt="" />
            <span>{data.user?.displayName}</span>
          </>
        )}

        <div>
          <Modal
            keepMounted
            open={open}
            onClose={handleClose}
            aria-labelledby="keep-mounted-modal-title"
            aria-describedby="keep-mounted-modal-description"
          >
            <Box sx={style}>
              <Typography
                id="keep-mounted-modal-title"
                variant="h6"
                component="h2"
                style={{ marginBottom: "10px" }}
              >
                Thêm thành viên
              </Typography>
              <Stack spacing={3}>
                <Autocomplete
                  freeSolo
                  filterSelectedOptions
                  id="free-solo-2-demo"
                  disableClearable
                  multiple
                  value={autocompleteValue}
                  options={options}
                  onInputChange={handleSearch}
                  onChange={handleUserSelect}
                  getOptionLabel={(option) => option.displayName}
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
                      label="Tìm kiếm"
                      style={{ marginBottom: "10px" }}
                      InputProps={{
                        ...params.InputProps,
                        type: "search",
                      }}
                    />
                  )}
                />
              </Stack>

              <Button onClick={handleAddMember}>OK</Button>
              <Button onClick={handleClose}>Cancel</Button>
            </Box>
          </Modal>
        </div>

        <div className="converIcons">
          {data.groupId !== "null" && (
            <div className="item">
              <PersonAddAlt1Icon onClick={handleOpen} />
            </div>
          )}

          <div className="item">
            <CallIcon />
          </div>

          <div className="item">
            <VideocamIcon />
          </div>

          {data.groupId === "null" ? (
            <div className="item">
              <DeleteIcon onClick={handleOpenChat} />
              <Modal
                open={openChat}
                onClose={handleCloseChat}
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
                    Bạn có chắc chắn muốn xóa đoạn chat này?
                  </Typography>

                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Button
                      style={{ marginLeft: "40px" }}
                      onClick={() => {
                        handleCloseChat();
                        deleteChat();
                      }}
                    >
                      Xóa
                    </Button>
                    <Button
                      style={{ marginRight: "40px" }}
                      onClick={handleCloseChat}
                    >
                      Cancel
                    </Button>
                  </div>
                </Box>
              </Modal>
            </div>
          ) : (
            <div className="item">
              <MoreHorizOutlinedIcon onClick={onMoreIconClick} />
            </div>
          )}
        </div>
      </div>
      <Messages />
      <Input />
    </div>
  );
};

export default Conversations;
