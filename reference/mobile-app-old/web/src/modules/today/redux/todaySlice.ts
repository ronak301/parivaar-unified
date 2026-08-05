import { createSlice } from "@reduxjs/toolkit";

type GreetingStatus = {
  SUCCESS: "SUCCESS";
  ERROR: "ERROR";
  PENDING: "PENDING";
  INACTIVE: "INACTIVE";
};

interface TodaySlice {
  dailyStatus: {
    [key: string]: string;
  };
  dailyGreetings: {
    [key: string]: keyof GreetingStatus | string;
  };
  dailyBirthdayWishedIds: {
    [key: string]: string[];
  };
}

const initialState: TodaySlice = {
  dailyStatus: {},
  dailyGreetings: {},
  dailyBirthdayWishedIds: {},
};

export const todaySlice = createSlice({
  name: "today",
  initialState,
  reducers: {
    setDailyStatus: (state, action) => {
      state.dailyStatus = action?.payload;
    },
    addDailyGreetings: (state, action) => {
      state.dailyGreetings = {
        ...state.dailyGreetings,
        ...action.payload,
      };
    },
    addTodaysBirthdayWishedIds: (state, action) => {
      state.dailyBirthdayWishedIds = action.payload;
    },
    resetToday: (state) => {
      state.dailyBirthdayWishedIds = {};
      state.dailyGreetings = {};
      state.dailyStatus = {};
    },
  },
});

export const {
  addDailyGreetings,
  setDailyStatus,
  addTodaysBirthdayWishedIds,
  resetToday,
} = todaySlice.actions;

export default todaySlice.reducer;
