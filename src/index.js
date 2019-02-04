/**
 * Plugin entry point.
 * @returns {undefined}
 */
export default function babelPluginCloudinary() {
    return {
        visitor: {
            CallExpression(path) {
                if (
                    path.node && path.node.callee && path.node.callee.name === "url"
                ) {
                    // eslint-disable-next-line
                    console.log("success");
                }
            },
        },
    };
}
