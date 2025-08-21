import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=ebaf5afc"; const _jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import __vite__cjsImport1_react from "/node_modules/.vite/deps/react.js?v=ebaf5afc"; const StrictMode = __vite__cjsImport1_react["StrictMode"];
import __vite__cjsImport2_reactDom_client from "/node_modules/.vite/deps/react-dom_client.js?v=ebaf5afc"; const ReactDOM = __vite__cjsImport2_reactDom_client.__esModule ? __vite__cjsImport2_reactDom_client.default : __vite__cjsImport2_reactDom_client;
import { QueryClient, QueryClientProvider } from "/node_modules/.vite/deps/@tanstack_react-query.js?v=ebaf5afc";
import "/src/assets/css/index.css?t=1747293887448";
import { RouterProvider } from "/node_modules/.vite/deps/react-router-dom.js?v=ebaf5afc";
import { router } from "/src/router/router.tsx?t=1747293887448";
import { ThemeProvider } from "/src/Provider/themeProvider.tsx";
import { Toaster } from "/src/components/ui/toaster.tsx";
const queryClient = new QueryClient;
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/ _jsxDEV(StrictMode, {
    children: /*#__PURE__*/ _jsxDEV(QueryClientProvider, {
        client: queryClient,
        children: /*#__PURE__*/ _jsxDEV(ThemeProvider, {
            defaultTheme: "dark",
            storageKey: "vite-ui-theme",
            children: [
                /*#__PURE__*/ _jsxDEV(Toaster, {}, void 0, false, {
                    fileName: "/Users/sushildhakal/Desktop/React app/dashboard/src/main.tsx",
                    lineNumber: 21,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ _jsxDEV(RouterProvider, {
                    router: router
                }, void 0, false, {
                    fileName: "/Users/sushildhakal/Desktop/React app/dashboard/src/main.tsx",
                    lineNumber: 23,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "/Users/sushildhakal/Desktop/React app/dashboard/src/main.tsx",
            lineNumber: 20,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "/Users/sushildhakal/Desktop/React app/dashboard/src/main.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this)
}, void 0, false, {
    fileName: "/Users/sushildhakal/Desktop/React app/dashboard/src/main.tsx",
    lineNumber: 17,
    columnNumber: 3
}, this));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4udHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFN0cmljdE1vZGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20vY2xpZW50J1xuaW1wb3J0IHtcbiAgUXVlcnlDbGllbnQsXG4gIFF1ZXJ5Q2xpZW50UHJvdmlkZXIsXG59IGZyb20gJ0B0YW5zdGFjay9yZWFjdC1xdWVyeSdcbmltcG9ydCAnQC9hc3NldHMvY3NzL2luZGV4LmNzcydcbmltcG9ydCB7IFJvdXRlclByb3ZpZGVyIH0gZnJvbSAncmVhY3Qtcm91dGVyLWRvbSdcbmltcG9ydCB7IHJvdXRlciB9IGZyb20gJ0Avcm91dGVyL3JvdXRlcidcbmltcG9ydCB7IFRoZW1lUHJvdmlkZXIgfSBmcm9tICdAL1Byb3ZpZGVyL3RoZW1lUHJvdmlkZXInXG5pbXBvcnQgeyBUb2FzdGVyIH0gZnJvbSAnQC9jb21wb25lbnRzL3VpL3RvYXN0ZXInXG5cblxuY29uc3QgcXVlcnlDbGllbnQgPSBuZXcgUXVlcnlDbGllbnRcblxuUmVhY3RET00uY3JlYXRlUm9vdChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncm9vdCcpISkucmVuZGVyKFxuICA8U3RyaWN0TW9kZT5cblxuICAgIDxRdWVyeUNsaWVudFByb3ZpZGVyIGNsaWVudD17cXVlcnlDbGllbnR9PlxuICAgICAgPFRoZW1lUHJvdmlkZXIgZGVmYXVsdFRoZW1lPVwiZGFya1wiIHN0b3JhZ2VLZXk9XCJ2aXRlLXVpLXRoZW1lXCI+XG4gICAgICAgIDxUb2FzdGVyIC8+XG5cbiAgICAgICAgPFJvdXRlclByb3ZpZGVyIHJvdXRlcj17cm91dGVyfSAvPlxuICAgICAgPC9UaGVtZVByb3ZpZGVyPlxuICAgIDwvUXVlcnlDbGllbnRQcm92aWRlcj5cbiAgPC9TdHJpY3RNb2RlPixcbilcbiJdLCJuYW1lcyI6WyJTdHJpY3RNb2RlIiwiUmVhY3RET00iLCJRdWVyeUNsaWVudCIsIlF1ZXJ5Q2xpZW50UHJvdmlkZXIiLCJSb3V0ZXJQcm92aWRlciIsInJvdXRlciIsIlRoZW1lUHJvdmlkZXIiLCJUb2FzdGVyIiwicXVlcnlDbGllbnQiLCJjcmVhdGVSb290IiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsInJlbmRlciIsImNsaWVudCIsImRlZmF1bHRUaGVtZSIsInN0b3JhZ2VLZXkiXSwibWFwcGluZ3MiOiI7QUFBQSxTQUFTQSxVQUFVLFFBQVEsUUFBTztBQUNsQyxPQUFPQyxjQUFjLG1CQUFrQjtBQUN2QyxTQUNFQyxXQUFXLEVBQ1hDLG1CQUFtQixRQUNkLHdCQUF1QjtBQUM5QixPQUFPLHlCQUF3QjtBQUMvQixTQUFTQyxjQUFjLFFBQVEsbUJBQWtCO0FBQ2pELFNBQVNDLE1BQU0sUUFBUSxrQkFBaUI7QUFDeEMsU0FBU0MsYUFBYSxRQUFRLDJCQUEwQjtBQUN4RCxTQUFTQyxPQUFPLFFBQVEsMEJBQXlCO0FBR2pELE1BQU1DLGNBQWMsSUFBSU47QUFFeEJELFNBQVNRLFVBQVUsQ0FBQ0MsU0FBU0MsY0FBYyxDQUFDLFNBQVVDLE1BQU0sZUFDMUQsUUFBQ1o7Y0FFQyxjQUFBLFFBQUNHO1FBQW9CVSxRQUFRTDtrQkFDM0IsY0FBQSxRQUFDRjtZQUFjUSxjQUFhO1lBQU9DLFlBQVc7OzhCQUM1QyxRQUFDUjs7Ozs7OEJBRUQsUUFBQ0g7b0JBQWVDLFFBQVFBIn0=