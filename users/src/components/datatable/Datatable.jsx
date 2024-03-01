import "./datatable.scss";
import { DataGrid } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { makeRequest } from "../../axios";
import { userColumns } from "../../datatablesource";
import { Box, Button, Typography, Modal } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Datatable = () => {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const handleOpen = (id) => {
    setDeleteId(id); // Cập nhật id khi mở modal
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await makeRequest.post("/admin/data");
        const dataWithId = response.data.data.map((item) => ({
          ...item,
          id: item.id,
        }));

        setData(dataWithId);
      } catch (error) {
        console.error("Error fetching data from API: ", error);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async () => {
    try {
      const response = await makeRequest.delete(`/admin/data/${deleteId}`, {
        data: { id: deleteId },
      });

      if (response.data.success) {
        setData((prevData) => prevData.filter((item) => item.id !== deleteId));
      }
      toast.success("Xóa tài khoản thành công!");
      handleClose(); // Đóng modal sau khi xóa
    } catch (error) {
      console.error("Error deleting user: ", error);
    }
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <Link
              to={`/admin/editU/${params.row.id}`}
              style={{ textDecoration: "none" }}
            >
              <div className="viewButton">View</div>
            </Link>
            <div
              className="deleteButton"
              onClick={() => handleOpen(params.row.id)}
            >
              Delete
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="datatable">
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
            style={{ marginBottom: "30px" }}
          >
            Bạn có chắc chắn muốn xóa tài khoản này?
          </Typography>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              style={{ marginLeft: "40px" }}
              onClick={() => {
                handleClose();
                handleDelete();
              }}
            >
              Xóa
            </Button>
            <Button style={{ marginRight: "40px" }} onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </Box>
      </Modal>
      <div className="datatableTitle">Users</div>
      <DataGrid
        className="datagrid"
        rows={data}
        columns={userColumns.concat(actionColumn)}
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection
      />
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default Datatable;
