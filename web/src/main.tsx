import React from 'react';
import ReactDOM from 'react-dom/client';
import './main.css';
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {Login, loginLoader} from "./routes/login";
import {createTheme, CssBaseline, responsiveFontSizes, ThemeProvider} from "@mui/material";
import {SnackbarProvider} from "notistack";
import {Holder, holderLoader} from "./routes/dashboard/holder";
import {Section} from "./routes/dashboard/section";
import {aboutSection} from "./routes/dashboard/about_event";
import {aboutMeSection} from "./routes/dashboard/about_me";
import {moneyChartSection} from "./routes/dashboard/money_chart";
import {goodsSection} from "./routes/dashboard/goods";
import {makeTransactionSection} from "./routes/dashboard/make_transaction";

const sections: Section[] = [aboutSection, moneyChartSection, goodsSection, makeTransactionSection]

const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login/>,
        loader: loginLoader
    },
    {
        path: "/",
        element: <Holder sections={sections}/>,
        loader: holderLoader,
        children: sections

    }
])

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
    typography: {
        fontSize: 32
    }
});


ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider theme={darkTheme}>
            <CssBaseline enableColorScheme={true}/>
            <SnackbarProvider maxSnack={5}>
                <RouterProvider router={router}/>
            </SnackbarProvider>
        </ThemeProvider>
    </React.StrictMode>
);