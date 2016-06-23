const http = {}

http['get'] = jest.fn();
http['get'].mockReturnValue(Promise.resolve({}))

http['post'] = jest.fn();
http['post'].mockReturnValue(Promise.resolve({}))

http['put'] = jest.fn();
http['put'].mockReturnValue(Promise.resolve({}))

http['delete'] = jest.fn();
http['delete'].mockReturnValue(Promise.resolve({}))

export default function Http(){
  return http
}
