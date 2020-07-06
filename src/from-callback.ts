import { Observable } from 'rxjs';

export const fromCallback = (fn, args?) => {
  return new Observable(sub => {
    fn({
      ...args,
      onSuccess: args => {
        sub.next(args);
        sub.complete();
      },
      onFail: args => sub.error(args),
    });
  });
};
