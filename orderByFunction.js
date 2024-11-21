const orderByStartup = (order) => {
  switch (order) {
    case 'id':
      return { id: 'asc' };
    case 'actualInvestDesc':
      return { actualInvest: 'desc' };
    case 'actualInvestAsc':
      return { actualInvest: 'asc' };
    case 'simInvestDesc':
      return { simInvest: 'desc' };
    case 'simInvestAsc':
      return { simInvest: 'asc' };
    case 'revenueDesc':
      return { revenue: 'desc' };
    case 'revenueAsc':
      return { revenue: 'asc' };
    case 'employeesDesc':
      return { employees: 'desc' };
    case 'employeesAsc':
      return { employees: 'asc' };
    case 'countDesc':
      return { count: 'desc' };
    case 'countAsc':
      return { count: 'asc' };
    default:
      return { id: 'asc' };
  }
}

export default orderByStartup;
