import { Transform } from 'class-transformer';

export const ToBoolean = () =>
  Transform(({ value }): any => {
    if (String(value).toLowerCase() === 'true' || value === true) return true;
    if (String(value).toLowerCase() === 'false' || value === false)
      return false;
    return value;
  });
