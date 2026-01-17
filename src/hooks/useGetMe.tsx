"use client";

import { useAppDispatch } from "@/redux/hook";
import { setUserData } from "@/redux/slices/userSlice";
import axios from "axios";
import { useEffect } from "react";

const useGetMe = () => {
      const dispatch = useAppDispatch();

      useEffect(() => {
            const getMe = async () => {
                  try {
                        const result = await axios.get("/api/me");
                        console.log("result: ", result.data);
                        dispatch(setUserData(result.data))
                  } catch (error) {
                        console.log(error);
                  }
            }

            getMe();
      }, [])
};

export default useGetMe;