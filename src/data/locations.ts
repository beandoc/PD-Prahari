
export interface City {
  name: string;
}

export interface State {
  name: string;
  cities: City[];
}

export const indianStates: State[] = [
  {
    name: 'Maharashtra',
    cities: [
      { name: 'Mumbai' },
      { name: 'Pune' },
      { name: 'Nagpur' },
      { name: 'Nashik' },
      { name: 'Thane' },
    ],
  },
  {
    name: 'Karnataka',
    cities: [
      { name: 'Bengaluru' },
      { name: 'Mysuru' },
      { name: 'Mangaluru' },
      { name: 'Hubballi' },
    ],
  },
  {
    name: 'Tamil Nadu',
    cities: [
      { name: 'Chennai' },
      { name: 'Coimbatore' },
      { name: 'Madurai' },
      { name: 'Tiruchirappalli' },
    ],
  },
  {
    name: 'Delhi',
    cities: [
      { name: 'New Delhi' },
    ],
  },
  {
    name: 'Gujarat',
    cities: [
        { name: 'Ahmedabad' },
        { name: 'Surat' },
        { name: 'Vadodara' },
        { name: 'Rajkot' },
    ]
  }
];
