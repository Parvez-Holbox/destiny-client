import React, { useMemo, useEffect, useState } from 'react';
import ProductCart from './product-cart';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PAGE_URL } from '../helper/constants';
import { MainLoader } from './common';
import PleaseWait from './please-wait-animation';
import { useParams, useNavigate } from 'react-router-dom';

export default function ProductPage() {

  const [showLoader, setShowLoader] = useState(false);
  const [pageData, setPageData] = useState(null);
  const { templateId, pageId } = useParams();
  const navigate = useNavigate();

  // 146f9c8f-291e-4318-aa07-119e65bc16e6

  // Regular expression to validate UUID
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  useEffect(() => {

    const setPageDataToSite = async () => {

      try {
  
        setShowLoader(true);


        // Check if cached data exists
        // const cachedData = localStorage.getItem('pageData');
        // if (cachedData) {

        //     const result = JSON.parse(cachedData);

        //     if (result.page_id === pageId) {

        //         setPageData(JSON.parse(cachedData));
        //         setShowLoader(false);
        //         return;

        //     }
            
        // }


        const resp = await PAGE_URL.get(`/get-page-info?page_id=3ffbdd50-2a72-4066-a8ee-ead25762dec9`);
        const result = resp.data.result;
        console.log(PAGE_URL);
        console.log(pageId);
        
        
        if (result.data === null) {
            navigate('/not-found'); // Redirect to "Not Found" page
            return;
        }

        setPageData(result.data);

        // Cache the data
        // localStorage.setItem('pageData', JSON.stringify(result.data));
        // setPageData(result.data);
  
      } catch (e) {
  
        toast.error('Something went wrong!')
  
      } finally {

        setShowLoader(false);

      }

    };

    if (!isValidUUID.test('3ffbdd50-2a72-4066-a8ee-ead25762dec9')) {
        navigate('/not-found'); // Redirect to "Not Found" page
        return;
    }

    setPageDataToSite();

  }, []);

  // Use `useMemo` to memoize the `pageData` object
  const memoizedPageData = useMemo(() => pageData, [pageData]);

  return (

    <MainLoader show={showLoader}>

        {memoizedPageData !== null ? <div className='relative w-full'><ProductCart { ...memoizedPageData } /></div> : <PleaseWait />}

        <ToastContainer />

    </MainLoader>


  );

}