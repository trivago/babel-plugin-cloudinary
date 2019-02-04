import * as t from "babel-types";

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
                  path.replaceWith(
                    t.callExpression(t.identifier("_transpiledURL"), [ t.stringLiteral("imageName") ]),
                  );
                }
            },
        },
    };
}
