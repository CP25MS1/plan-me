export interface Field {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
}

export const fieldsByType: Record<string, Field[]> = {
  Lodging: [
    { label: 'ชื่อโรงแรม', name: 'lodgingName', maxLength: 80, required: true },
    { label: 'ที่อยู่โรงแรม', name: 'lodgingAddress', required: true },
    { label: 'ชื่อผู้จอง', name: 'underName', maxLength: 80, required: true },
    { label: 'วันที่ Check in', name: 'checkinDate', type: 'datetime-local', required: true },
    { label: 'วันที่ Check out', name: 'checkoutDate', type: 'datetime-local', required: true },
    { label: 'หมายเลขการจอง', name: 'bookingRef' },
    { label: 'เบอร์ติดต่อ', name: 'contactTel', maxLength: 10 },
    { label: 'Email ติดต่อ', name: 'contactEmail', type: 'email', maxLength: 80 },
    { label: 'ราคา', name: 'cost', type: 'number', required: true },
  ],

  Restaurant: [
    { label: 'ชื่อร้านอาหาร', name: 'restaurantName', maxLength: 80, required: true },
    { label: 'ที่อยู่ร้านอาหาร', name: 'restaurantAddress', required: true },
    { label: 'ชื่อผู้จอง', name: 'underName', maxLength: 80, required: true },
    { label: 'วันที่จอง', name: 'reservationDate', type: 'date', required: true },
    { label: 'เวลาที่จอง', name: 'reservationTime', type: 'time' },
    { label: 'หมายเลขโต๊ะ', name: 'tableNo' },
    { label: 'หมายเลขคิว', name: 'queueNo' },
    { label: 'จำนวนสมาชิก', name: 'partySize', type: 'number' },
    { label: 'หมายเลขการจอง', name: 'bookingRef' },
    { label: 'เบอร์ติดต่อ', name: 'contactTel', maxLength: 10 },
    { label: 'Email ติดต่อ', name: 'contactEmail', type: 'email', maxLength: 80 },
    { label: 'ราคา', name: 'cost', type: 'number', required: true },
  ],

  Flight: [
    { label: 'สายการบิน', name: 'airline', maxLength: 20, required: true },
    { label: 'หมายเลขเที่ยวบิน', name: 'flightNo', maxLength: 6, required: true },
    { label: 'เวลา Boarding', name: 'boardingTime', type: 'datetime-local' },
    { label: 'Gate', name: 'gateNo', maxLength: 4 },
    { label: 'สนามบินต้นทาง', name: 'departureAirport', required: true },
    { label: 'เวลาออกเดินทาง', name: 'departureTime', type: 'datetime-local', required: true },
    { label: 'สนามบินปลายทาง', name: 'arrivalAirport', required: true },
    { label: 'เวลาถึง', name: 'arrivalTime', type: 'datetime-local', required: true },
    { label: 'ชั้นโดยสาร', name: 'flightClass', maxLength: 10 },
    { label: 'หมายเลขการจอง', name: 'bookingRef' },
    { label: 'เบอร์ติดต่อ', name: 'contactTel', maxLength: 10 },
    { label: 'Email ติดต่อ', name: 'contactEmail', type: 'email', maxLength: 80 },
    { label: 'ราคา', name: 'cost', type: 'number', required: true },
  ],

  Train: [
    { label: 'หมายเลขขบวน', name: 'trainNo', required: true },
    { label: 'ชั้นโดยสาร', name: 'trainClass', required: true },
    { label: 'ประเภทที่นั่ง', name: 'seatClass', required: true },
    { label: 'หมายเลขที่นั่ง', name: 'seatNo', required: true },
    { label: 'ชื่อผู้โดยสาร', name: 'passengerName', maxLength: 80, required: true },
    { label: 'สถานีต้นทาง', name: 'departureStation', required: true },
    { label: 'เวลาออกเดินทาง', name: 'departureTime', type: 'datetime-local', required: true },
    { label: 'สถานีปลายทาง', name: 'arrivalStation', required: true },
    { label: 'เวลาถึง', name: 'arrivalTime', type: 'datetime-local', required: true },
    { label: 'หมายเลขการจอง', name: 'bookingRef' },
    { label: 'เบอร์ติดต่อ', name: 'contactTel', maxLength: 10 },
    { label: 'Email ติดต่อ', name: 'contactEmail', type: 'email', maxLength: 80 },
    { label: 'ราคา', name: 'cost', type: 'number', required: true },
  ],

  Bus: [
    { label: 'ชื่อบริษัทรถ', name: 'transportCompany', required: true },
    { label: 'สถานีต้นทาง', name: 'departureStation', required: true },
    { label: 'เวลาออกเดินทาง', name: 'departureTime', type: 'datetime-local', required: true },
    { label: 'สถานีปลายทาง', name: 'arrivalStation', required: true },
    { label: 'ประเภทรถ', name: 'busClass' },
    { label: 'ชื่อผู้โดยสาร', name: 'passengerName', maxLength: 80, required: true },
    { label: 'หมายเลขที่นั่ง', name: 'seatNo', required: true },
    { label: 'หมายเลขการจอง', name: 'bookingRef' },
    { label: 'เบอร์ติดต่อ', name: 'contactTel', maxLength: 10 },
    { label: 'Email ติดต่อ', name: 'contactEmail', type: 'email', maxLength: 80 },
    { label: 'ราคา', name: 'cost', type: 'number', required: true },
  ],

  Ferry: [
    { label: 'ชื่อบริษัทเรือ', name: 'transportCompany', required: true },
    { label: 'ชื่อผู้โดยสาร', name: 'passengerName', maxLength: 80, required: true },
    { label: 'ท่าเรือต้นทาง', name: 'departurePort', required: true },
    { label: 'เวลาเรือออก', name: 'departureTime', type: 'datetime-local', required: true },
    { label: 'ท่าเรือปลายทาง', name: 'arrivalPort', required: true },
    { label: 'เวลาถึง', name: 'arrivalTime', type: 'datetime-local', required: true },
    { label: 'ประเภทตั๋ว', name: 'ticketType', required: true },
    { label: 'หมายเลขการจอง', name: 'bookingRef' },
    { label: 'เบอร์ติดต่อ', name: 'contactTel', maxLength: 10 },
    { label: 'Email ติดต่อ', name: 'contactEmail', type: 'email', maxLength: 80 },
    { label: 'ราคา', name: 'cost', type: 'number', required: true },
  ],

  CarRental: [
    { label: 'ชื่อบริษัทเช่า', name: 'rentalCompany', required: true },
    { label: 'รุ่นรถ', name: 'carModel', required: true },
    { label: 'หมายเลขทะเบียน', name: 'vrn', maxLength: 10, required: true },
    { label: 'ชื่อผู้เช่า', name: 'renterName', maxLength: 80, required: true },
    { label: 'สถานที่รับรถ', name: 'pickupLocation', required: true },
    { label: 'เวลารับรถ', name: 'pickupTime', type: 'datetime-local', required: true },
    { label: 'สถานที่คืนรถ', name: 'dropoffLocation', required: true },
    { label: 'เวลาคืนรถ', name: 'dropoffTime', type: 'datetime-local', required: true },
    { label: 'หมายเลขการจอง', name: 'bookingRef' },
    { label: 'เบอร์ติดต่อ', name: 'contactTel', maxLength: 10 },
    { label: 'Email ติดต่อ', name: 'contactEmail', type: 'email', maxLength: 80 },
    { label: 'ราคา', name: 'cost', type: 'number', required: true },
  ],
};
