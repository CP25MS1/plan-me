import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import 'dayjs/locale/th';
import 'dayjs/locale/en';

dayjs.extend(buddhistEra);
dayjs.extend(relativeTime);
dayjs.locale('th');

export default dayjs;
