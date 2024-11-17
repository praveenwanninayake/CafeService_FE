import { AgGridReact } from "ag-grid-react"
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Button, Dialog, DialogContent, DialogTitle, FormControl, FormControlLabel, FormHelperText, FormLabel, IconButton, InputLabel, MenuItem, Paper, Radio, RadioGroup, Select, Stack, TextField, Typography } from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from 'yup';
import { toast } from "react-toastify";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

//Input validations
const employeeSchema = Yup.object().shape({
    id: Yup.string()
        .matches(/^UI[a-zA-Z0-9]{7}$/, "ID must be in the format 'UIXXXXXXX'")
        .required('Id is required'),
    name: Yup.string().required('Name is required'),
    gender: Yup.string().required("Please select your gender"),
    emailAddress: Yup.string()
        .email("Invalid email format")
        .required('Email is required'),
    phoneNumber: Yup.string()
        .matches(/^[89]\d{7}$/, "Phone number must start with 8 or 9 and be 8 digits long")
        .required('Contact is required'),
    cafe: Yup.string(),
    startDate: Yup.string().nullable(),
});


export default function Employees() {
    const EmployeeList = () => {
        const fileInputRef1 = useRef(null)
        const [initialValues, setInitialValues] = useState({ id: '', name: '', gender: 0, emailAddress: '', phoneNumber: '', startDate: null, cafe: 'none', type: 'I' });
        const [employees, setEmployees] = useState([]);
        const [loading, setLoading] = useState(false);
        const [openDeleteModal, setOpenDeleteModal] = useState(false);
        const [deleteId, setDeleteId] = useState(null);        
        const [cafes, setCafes] = useState([]);
        const [open, openchange] = useState(false);

        // Define the columns for the table
        const columns = [
            { field: 'id', headerName: 'Id', hide: true },
            { field: 'name', headerName: 'Name' },
            { field: 'gender', headerName: 'Gender' },
            { field: 'emailAddress', headerName: 'Email' },
            { field: 'phoneNumber', headerName: 'Contact' },
            {
                field: 'daysWorked', headerName: 'Days Worked', cellRenderer: (params) => {
                    const value = params.data.daysWorked;
                    // Check if the value is 0, negative, or null/undefined, then display '-'
                    return (value === 0 || value < 0 || value === null || value === undefined) ? '-' : value;
                }
            },
            {
                field: 'cafe', headerName: 'Cafe', cellRenderer: (params) => {
                    // Check if the value is null or empty, then display '-'
                    return params.data.cafe !== '' ? params.data.cafe : '-';
                }
            },

            {
                field: 'action',
                headerName: 'Action',
                cellRenderer: (params) => {
                    return (
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <IconButton onClick={() => handleEdit(params?.data?.id)} color="primary">
                                <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => { setDeleteId(params?.data?.id); setOpenDeleteModal(true) }} color="error">
                                <DeleteIcon />
                            </IconButton>
                        </div>
                    );
                }
            }
        ]

       
        useEffect(() => {

            fetchData();
            fetchCafeData();

        }, []);

        // Fetch data from the API
        const fetchData = async (searchName) => {
            try {
                setLoading(true);
                let response = null;
                if (searchName) {
                    searchName = searchName.toLowerCase();
                    response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/employees?page=1&items_per_page=10&cafe=${searchName}`);
                }else{
                    response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/employees?page=1&items_per_page=10`);
                }
                setEmployees(response.data);
            } catch (error) {
                console.error('Error fetching employees:', error);
            } finally {
                setLoading(false);
            }
        };


        // Fetch data from the API
        const fetchCafeData = async () => {
            try {

                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/cafe-list`);
                setCafes(response.data);
            } catch (error) {
                console.error('Error fetching cafes:', error);
            }
        };


        
        // Handle form submission
        const functionadd = () => {
            openpopup();
        }
        // Handle form submission
        const closepopup = () => {
            setInitialValues({ id: '', name: '', gender: 0, emailAddress: '', phoneNumber: '', startDate: null, cafe: 'none', type: 'I' });
            if (fileInputRef1.current) {
                fileInputRef1.current.value = '' 
            }
            openchange(false);
        }
        // Handle form submission
        const openpopup = () => {
            openchange(true);
        }
        // Handle form submission   
        const handleEdit = async (id) => {
            try {
                const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/employees/${id}`);
                setInitialValues({ id: data.id, name: data.name, gender: data.gender, emailAddress: data.emailAddress, phoneNumber: data.phoneNumber, startDate: data?.startDate ? dayjs(data.startDate) : null, cafe: data.fK_CafeId ?? 'none', type: 'U' }); //startDate: data.startDate
                openpopup();
            } catch (error) {
                console.log(error);
            }
        };
        // Handle form submission
        const handleDelete = async (id) => {
            try {
                const data = { id: deleteId };
                const response = await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/employee`, { data });
                if (response.status === 200) {
                    toast.success("Deleted Successfully");
                    fetchData();
                } else {
                    toast.error(data)
                }
            } catch (error) {
                console.log(error);
            } finally {
                setOpenDeleteModal(false);
                setDeleteId(null);
            }
        };

        // Handle form submission
        const handleDateChange = (date) => {
            setInitialValues((prevValues) => ({
                ...prevValues,
                startDate: date, 
            }));
        };


        return (
            <dev>
                <Paper sx={{ width: '100%', height: '100vh' }}>

                    <div style={{ textAlign: 'center' }}>
                        <h1>Employee Manager</h1>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1%' }}>
                        <TextField
                            label="Search By Cafe"
                            variant="outlined"
                            size="small"
                            onChange={(e) => fetchData(e.target.value)}
                        />
                        <Button onClick={() => functionadd()} variant="contained">Add New (+)</Button>
                    </div>


                    <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
                        {loading ? (
                            <p>Loading...</p>
                        ) : (
                            <AgGridReact
                                rowData={employees.data}
                                columnDefs={columns}
                                pagination={true}
                                paginationPageSize={10}
                                defaultColDef={{
                                    flex: 1,
                                    minWidth: 150,
                                    resizable: true,
                                }}
                            />
                        )}
                    </div>

                    <footer className="footer">
                        <div style={{ textAlign: 'center' }}>
                            <h5>© 2024 - 2025 Cafe Manager (Private) Limited, All rights reserved</h5>
                        </div>
                    </footer>


                </Paper>

                <Dialog open={open} onClose={closepopup} fullWidth maxWidth="sm">
                    <DialogTitle>
                        <span>Create Employee</span>
                    </DialogTitle>

                    <DialogContent>
                        <Formik
                            enableReinitialize
                            initialValues={initialValues}
                            validationSchema={employeeSchema} 
                            onSubmit={async (values, { setSubmitting, resetForm }) => {
                                try {
                                    setSubmitting(true)
                                    const formData = new FormData()
                                    formData.append('id', values?.id ?? '')
                                    formData.append('name', values?.name ?? '')
                                    formData.append('gender', values?.gender ?? '')
                                    formData.append('emailAddress', values?.emailAddress ?? '')
                                    formData.append('phoneNumber', values?.phoneNumber ?? '')
                                    formData.append('startDate', values.startDate ? dayjs(values.startDate) : '')
                                    formData.append('cafeId', values?.cafe === 'none' ? '' : values?.cafe)

                                   
                                    let response;
                                    if (values?.type === 'I') {
                                        response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/employee`, formData, {
                                            headers: {
                                                'Content-Type': 'multipart/form-data',
                                                Accept: 'application/json',
                                            },
                                        });
                                    } else {
                                        response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/employee`, formData, {
                                            headers: {
                                                'Content-Type': 'multipart/form-data',
                                                Accept: 'application/json',
                                            },
                                        });
                                    }

                                    if (response.status === 200) {
                                        toast.success(response.data)
                                        resetForm()
                                        closepopup()
                                        fetchData()
                                    } else {
                                        toast.error(response.data)
                                    }
                                } catch (error) {
                                    console.error('Error submitting form:', error);
                                } finally {
                                    setSubmitting(false)
                                }
                            }}
                        >
                            {({
                                values,
                                errors,
                                touched,
                                handleChange,
                                handleBlur,
                                handleSubmit,
                                setFieldValue,
                                isSubmitting,
                                isValid,
                                dirty,
                            }) => (
                                <Form onSubmit={handleSubmit}>
                                    <Stack spacing={2} margin={2}>
                                        <TextField
                                            required
                                            variant="outlined"
                                            label="Id"
                                            id="id"
                                            value={values.id}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.id && Boolean(errors.id)}
                                            helperText={touched.id && errors.id}
                                        />
                                        <TextField
                                            required
                                            variant="outlined"
                                            label="Name"
                                            id="name"
                                            value={values.name}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.name && Boolean(errors.name)}
                                            helperText={touched.name && errors.name}
                                        />
                                        <FormControl component="fieldset">
                                            <FormLabel component="legend">Gender</FormLabel>
                                            <RadioGroup
                                                aria-label="gender"
                                                name="gender"
                                                value={values.gender}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            >
                                                <FormControlLabel value="1" control={<Radio />} label="Male" />
                                                <FormControlLabel value="2" control={<Radio />} label="Female" />
                                            </RadioGroup>
                                            {touched.gender && errors.gender && (
                                                <div style={{ color: "red", fontSize: "0.8rem" }}>{errors.gender}</div>
                                            )}
                                        </FormControl>


                                        <TextField
                                            required
                                            variant="outlined"
                                            label="Email"
                                            id="emailAddress"
                                            value={values.emailAddress}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.emailAddress && Boolean(errors.emailAddress)}
                                            helperText={touched.emailAddress && errors.emailAddress}
                                        />
                                        <TextField
                                            required
                                            variant="outlined"
                                            label="Contact"
                                            id="phoneNumber"
                                            value={values.phoneNumber}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.phoneNumber && Boolean(errors.phoneNumber)}
                                            helperText={touched.phoneNumber && errors.phoneNumber}
                                        />

                                        <FormControl fullWidth error={touched.cafe && Boolean(errors.cafe)}>
                                            <InputLabel id="cafe">Cafe</InputLabel>
                                            <Select
                                                labelId="cafe"
                                                id="cafe"
                                                value={values.cafe}
                                                onChange={(e) => {
                                                    if (e.target.value === 'none') {
                                                        setFieldValue('startDate', null);
                                                    }
                                                    setFieldValue('cafe', e.target.value)
                                                }}
                                                onBlur={handleBlur}
                                                label="Cafe"
                                                name="cafe"
                                            >
                                                <MenuItem value="none">
                                                    <em>None</em>
                                                </MenuItem>

                                                {cafes.data.length > 0 ? (
                                                    cafes.data.map((cafe) => (
                                                        <MenuItem key={cafe.key} value={cafe.key}>
                                                            {cafe.value}
                                                        </MenuItem>
                                                    ))
                                                ) : (
                                                    <MenuItem disabled>No cafes available</MenuItem>
                                                )}

                                            </Select>
                                            {touched.cafe && errors.cafe && (
                                                <FormHelperText>{errors.cafe}</FormHelperText>
                                            )}
                                        </FormControl>

                                        {values?.cafe !== 'none' && (
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <FormControl fullWidth>
                                                    <DatePicker
                                                        id="startDate"
                                                        label="Start Date"
                                                        value={values.startDate}
                                                        onChange={(newValue) => {
                                                            if (newValue === null) {
                                                                setFieldValue('startDate', null);
                                                            } else {
                                                                setFieldValue('startDate', newValue);
                                                            }
                                                        }}
                                                        onBlur={handleBlur}
                                                        error={touched.startDate && Boolean(errors.startDate)}
                                                        helperText={touched.startDate && errors.startDate}
                                                    />
                                                </FormControl>
                                            </LocalizationProvider>
                                        )}

                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={isSubmitting || !isValid || !dirty}
                                        >
                                            Submit
                                        </Button>
                                    </Stack>
                                </Form>
                            )}
                        </Formik>

                    </DialogContent>
                </Dialog>
                <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)} fullWidth maxWidth="sm">
                    <DialogTitle>
                        <span>Delete Confirmation</span>
                    </DialogTitle>

                    <DialogContent>
                        <Stack spacing={2} margin={2}>
                            <Typography>Are you sure you want to delete this item?</Typography>
                            <Button variant="outlined" color="primary" onClick={() => { setOpenDeleteModal(false); setDeleteId(null) }}>Cancel</Button>
                            <Button variant="contained" color="error" onClick={() => handleDelete(deleteId)}>Delete</Button>
                        </Stack>
                    </DialogContent>
                </Dialog>

            </dev>
        );


    }
    return <EmployeeList />
}