export interface SurveyRecord {
  id: string;
  villageId: string;
  phcId: string;
  districtId: string;
  stateId: string;
  locationType: 'PHC' | 'House' | 'Other';
  personName: string;
  wardNo: string;
  pincode: string;
  phone: string;
  surveyorId: string;
  surveyDate: string; // ISO string
  divyangCount: number;
  householdId: string;
}

export interface SurveyStats {
  totalSurveys: number;
  todaySurveys: number;
  divyangTotal: number;
  housesWithDivyang: number;
}
