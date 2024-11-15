import React, { useMemo, useEffect, useState } from 'react';
import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProductPage from './components/product-page';
import NotFound from './components/not-found';

export default function App() {
  console.log("working");
  
  return (
    <Router>
        <Routes>
            {/* Define a route with a dynamic parameter */}
            <Route path="/:templateId/:pageId" element={<ProductPage />} />
            <Route path="/not-found" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    </Router>
  );

}