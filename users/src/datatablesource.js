export const userColumns = [
  { field: "id", headerName: "ID", width: 200 },
  {
    field: "user",
    headerName: "User",
    width: 230,
    renderCell: (params) => {
      return (
        <div className="cellWithImg">
          <img className="cellImg" src={params.row.profilePic} alt="avatar" />
          {params.row.displayName}
        </div>
      );
    },
  },
  {
    field: "email",
    headerName: "Email",
    width: 230,
  },

  {
    field: "phone",
    headerName: "Phone",
    width: 200,
  },
  {
    field: "isAdmin",
    headerName: "Admin",
    width: 160,
    renderCell: (params) => {
      return (
        <div className={`cellWithStatus ${params.row.isAdmin}`}>
          {params.row.isAdmin}
        </div>
      );
    },
  },
];
