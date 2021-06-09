export * from "@solo-io/proxy-runtime/proxy"; // this exports the required functions for the proxy to interact with us.
import { RootContext, Context, registerRootContext, FilterHeadersStatusValues, stream_context, send_local_response, log, LogLevelValues, GrpcStatusValues } from "@solo-io/proxy-runtime";

class AddHeaderRoot extends RootContext {
  createContext(context_id: u32): Context {
    return new AddHeader(context_id, this);
  }
}

class AddHeader extends Context {
  constructor(context_id: u32, root_context: AddHeaderRoot) {
    super(context_id, root_context);
  }
  onResponseHeaders(a: u32, end_of_stream: bool): FilterHeadersStatusValues {
    log(LogLevelValues.warn, "context id: " + this.context_id.toString() + ": AddHeader.onResponseHeaders(" + a.toString() + ", " + end_of_stream.toString() + ")");

    const root_context = this.root_context;
    stream_context.headers.response.add("x-test-header", "---------!---");
    return FilterHeadersStatusValues.Continue;
  }

  // check and see if the user agent is curl, then 403...
  onRequestHeaders(a: u32, end_of_stream: bool): FilterHeadersStatusValues {
      log(LogLevelValues.warn, "context id: " + this.context_id.toString() + ": AddHeader.onRequestHeaders(" + a.toString() + ", " + end_of_stream.toString() + ")");

      let agent = stream_context.headers.request.get("user-agent");
      log(LogLevelValues.info, "agent:" + agent);

      if (agent.startsWith("curl")) {
        send_local_response(403, "Not Authorized", new ArrayBuffer(0), [], GrpcStatusValues.Internal);
        return FilterHeadersStatusValues.StopIteration;
      }
      return FilterHeadersStatusValues.Continue; 
  }
}

registerRootContext((context_id: u32) => { return new AddHeaderRoot(context_id); }, "add_header");