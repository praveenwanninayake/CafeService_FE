import { AgGridReact } from "ag-grid-react"
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Button, Dialog, DialogContent, DialogTitle, IconButton, Paper, Stack, TextField, Typography } from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from 'yup';
import { toast } from "react-toastify";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from "react-router-dom";

//Input validations
const cafeSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    description: Yup.string().required('Description is required'),
    location: Yup.string().required('Location is required'),
    logo: Yup.string().nullable(),
});

export default function Cafes() {

    const CafeList = () => {
        const navigate = useNavigate()
        const fileInputRef1 = useRef(null)
        const [initialValues, setInitialValues] = useState({ id: '', name: '', description: '', location: '', logo: null, logoUrl: '' });
        const [cafes, setCafes] = useState([]);
        const [loading, setLoading] = useState(false);
        const [openDeleteModal, setOpenDeleteModal] = useState(false);
        const [deleteId, setDeleteId] = useState(null);
        const [open, openchange] = useState(false);

        // Define the columns for the table
        const columns = [
            { field: 'id', headerName: 'Id', hide: true },
            {
                field: 'logo',
                headerName: 'Cafe',

                cellRenderer: (params) => {
                    const value = params.data.logo;
                    return value ? (<img src={`${process.env.REACT_APP_IMAGE_URL}/cafe/${value}`} style={{ width: '40px', height: '40px', objectFit: 'cover' }} />) : 'No Logo';
                }
            },
            { field: 'name', headerName: 'Name' },
            { field: 'description', headerName: 'Description' },
            {
                field: 'employeeCount', headerName: 'Employees', cellRenderer: (params) => (
                    <span
                        style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                        onClick={() => navigate('/employee')}
                    >
                        {params.value}
                    </span>
                ),
            },
            { field: 'location', headerName: 'Location' },
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
        }, []);

        // Fetch data from API
        const fetchData = async (searchName) => {
            try {
                setLoading(true);
                let response = null;
                if (searchName) {
                    searchName = searchName.toLowerCase();
                    response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/cafes?page=1&items_per_page=10&location=${searchName}`);
                } else {
                    response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/cafes?page=1&items_per_page=10`);
                }

                console.log('response', response.data)
                setCafes(response.data);
                console.log(response);
            } catch (error) {
                console.error('Error fetching cafes:', error);
            } finally {
                setLoading(false);
            }
        };

       
        // Function to handle logo image selection
        const onSelectFile = (e, setFieldValue) => {
            if (!e.target.files || e.target.files.length === 0) {
                setFieldValue('file', '')
                return
            }
            const file = e.target.files[0]
            if (file.type != 'image/png' && file.type != 'image/jpeg') {
                setFieldValue('file', '')
                toast.error('Please upload jpeg or png file')
                return
            }
            // Create a FileReader to read the file
            const reader = new FileReader()

            reader.onload = (event) => {
                const dataUrl = event.target?.result // This is the data URL
                setFieldValue('logoUrl', dataUrl) // Set the data URL as the file value
            }

            reader.readAsDataURL(file)
            setFieldValue('logo', file) //e.currentTarget.files[0])
        }

        // Function to handle form submission
        const functionadd = () => {
            openpopup();
        }
        // Function to handle form submission
        const closepopup = () => {
            setInitialValues({ id: '', name: '', description: '', location: '', logo: null, logoUrl: '' });
            if (fileInputRef1.current) {
                fileInputRef1.current.value = '' // Clear the file input
            }
            openchange(false);
        }
        // Function to handle form submission
        const openpopup = () => {
            openchange(true);
        }

        // Function to handle form submission
        const handleEdit = async (id) => {
            console.log(`Edit item with id: ${id}`);

            try {
                const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/cafes/${id}`);
                console.log(data);
                setInitialValues({ id: data.id, name: data.name, description: data.description, location: data.location, logo: data?.logo ?? null });
                openpopup();
            } catch (error) {
                console.log(error);
            }
        };

        // const functionedit = () => {

        // }

        // Function to handle form submission
        const handleDelete = async () => {
            try {
                const data = { id: deleteId };
                const response = await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/cafe`, { data });
                console.log('response', response);
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


        return (
            <dev>
                <Paper sx={{ width: '100%', height: '100vh' }}>

                    <div style={{ textAlign: 'center' }}>
                        <h1>Cafe Manager</h1>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1%' }}>
                        <TextField
                            label="Search By Location"
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
                                rowData={cafes.data}
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
                    <Formik
                        enableReinitialize
                        initialValues={initialValues}
                        validationSchema={cafeSchema} 
                        onSubmit={async (values, { setSubmitting, resetForm }) => {
                            console.log('Form submitted:', values);
                            try {
                                setSubmitting(true)

                                const formData = new FormData()
                                formData.append('id', values?.id ?? '')
                                formData.append('name', values?.name ?? '')
                                formData.append('description', values?.description ?? '')
                                formData.append('location', values?.location ?? '')
                                formData.append('logo', values?.logo ?? '')
                                
                                let response;
                                if (values?.id === '') {
                                    response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/cafe`, formData, {
                                        headers: {
                                            'Content-Type': 'multipart/form-data',
                                            Accept: 'application/json',
                                        },
                                    });
                                } else {
                                    response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/cafe`, formData, {
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
                                if (fileInputRef1.current) {
                                    fileInputRef1.current.value = '' 
                                }
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
                            <>
                                <DialogTitle>
                                    <span>{values?.id === '' ? 'Create' : 'Edit'} Cafe</span>
                                </DialogTitle>

                                <DialogContent>
                                    <Form onSubmit={handleSubmit}>
                                        <Stack spacing={2} margin={2}>
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
                                            <TextField
                                                required
                                                variant="outlined"
                                                label="Description"
                                                id="description"
                                                value={values.description}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.description && Boolean(errors.description)}
                                                helperText={touched.description && errors.description}
                                            />
                                            <TextField
                                                required
                                                variant="outlined"
                                                label="Location"
                                                id="location"
                                                value={values.location}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.location && Boolean(errors.location)}
                                                helperText={touched.location && errors.location}
                                            />
                                            <input
                                                ref={fileInputRef1}
                                                //variant="outlined"
                                                //label="Logo"
                                                id="logo"
                                                type="file"
                                                //value={values.logo}
                                                onChange={(e) => onSelectFile(e, setFieldValue)}
                                                onBlur={handleBlur}
                                            />
                                            {values?.logoUrl !== '' && (
                                                <img
                                                    src={values?.logoUrl}
                                                    alt='document'
                                                    style={{ width: '150px', height: '150px' }}
                                                />
                                            )}

                                            <Button
                                                type="submit"
                                                variant="contained"
                                                disabled={isSubmitting || !isValid || !dirty}
                                            >
                                                {values?.id === '' ? "Submit" : "Update"}
                                            </Button>
                                        </Stack>
                                    </Form>
                                </DialogContent>
                            </>
                        )}
                    </Formik>
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
    return <CafeList />

}






