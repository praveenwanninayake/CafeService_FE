import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Cafes from './Component/Cafes';
import Employees from './Component/Employees';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position='top-right'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        <Route path="/" element={<Cafes />}> </Route>
        <Route path="/cafe/employee/:cafeid" element={<Employees />}> </Route>
        <Route path="/employee" element={<Employees />}> </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
