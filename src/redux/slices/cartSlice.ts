import { IGrocery } from "@/models/grocery.model";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import mongoose from "mongoose";

export interface ICartGrocery extends IGrocery { quantity: number };

export interface ICartSlice {
      cartData: ICartGrocery[];
}

const initialState: ICartSlice = {
      cartData: []
}

const cartSlice = createSlice({
      name: "cart",
      initialState,
      reducers: {
            addToCart: (state, action: PayloadAction<ICartGrocery>) => {
                  state.cartData.push(action.payload)
            },
            increaseQuantity: (state, action: PayloadAction<mongoose.Types.ObjectId>) => {
                  const item = state.cartData.find(cItem => cItem._id === action.payload);

                  if (item) {
                        item.quantity = item.quantity + 1;
                  }

            },
            decreaseQuantity: (state, action: PayloadAction<mongoose.Types.ObjectId>) => {
                  const item = state.cartData.find(cItem => cItem._id === action.payload);
                  if (item?.quantity && item.quantity > 1) {
                        item.quantity = item.quantity - 1;
                  } else {
                        state.cartData = state.cartData.filter(cItem => cItem._id !== action.payload);
                  }

            },
      }
});

export const { addToCart, increaseQuantity, decreaseQuantity } = cartSlice.actions;

export default cartSlice.reducer;