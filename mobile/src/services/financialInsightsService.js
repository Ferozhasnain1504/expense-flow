
import API from './api';

// GET FINANCIAL INSIGHTS
export const fetchFinancialInsights = async (month, year) => {
  const response = await API.get('/financial-insights', {
    params: { month, year },
  });

  return response.data;
};
