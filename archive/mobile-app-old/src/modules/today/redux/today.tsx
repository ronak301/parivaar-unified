import { createSlice } from "@reduxjs/toolkit";

type GreetingStatus = {
  SUCCESS: "SUCCESS";
  ERROR: "ERROR";
  PENDING: "PENDING";
  INACTIVE: "INACTIVE";
};

/**
 * today: {
 *  "dailyStatus": {
 *    "31102023": "SUCCESS"
 *  },
 *  "dailyGreetings": {
 *
 *  }
 * }
 */

interface TodaySlice {
  dailyStatus: {
    [key: string]: string;
  };
  // Jain jinendra greeting
  dailyGreetings: {
    [key: string]: GreetingStatus;
  };
  // Birthday Wished users - ["qwe23", "sadas23434sd"]
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
      // action.payload = { "31102023": "SUCCESS" }
      state.dailyGreetings = {
        ...state.dailyGreetings,
        ...action.payload,
      };
    },
    addTodaysBirthdayWishedIds: (state, action) => {
      /**
       * action.playload = {
       *  [01012024]: ["123derere", "sdsdsd454dd"]
       * }
       */
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
} = todaySlice?.actions;

export default todaySlice.reducer;
