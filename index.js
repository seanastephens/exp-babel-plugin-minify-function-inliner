const _ = require('lodash');

module.exports = function(babel) {

  const {
    CallExpression,
    ExpressionStatement,
    AssignmentExpression,
    LabeledStatement,
    BreakStatement,
    arrowFunctionExpression,
    isArrayExpression,
    isExportDefaultDeclaration,
    ObjectProperty,
    VariableDeclaration,
    VariableDeclarator,
    NumericLiteral,
    Identifier,
    FunctionExpression
  } = babel.types;

  const EXPORT_NODE_TYPES = [
    isExportDefaultDeclaration
  ];

  return {
    visitor: {
      FunctionDeclaration(path) {

        const name = _.get(path.node, 'id.name');
        const references = path.scope.getBinding(name).referencePaths;

        if(references.length == 0) {
          path.remove();
        }

        if(references.length > 1) {
          // Too expensive to inline.
          return;
        }

        console.log('Inline it: ', path.node.id.name);

        const use = references[0];

        if(use.parent.type == 'ObjectProperty') {
          use.parentPath.replaceWith(
            ObjectProperty(
              use.parentPath.node.key,
              FunctionExpression(Identifier(''), path.node.params, path.node.body)
            )
          );
          path.remove();
        }

        if(use.parent.type == 'CallExpression') {
          const newScope = use.parentPath.scope;

          const newName = use.parentPath.scope.generateUidIdentifier();
          const label = use.parentPath.scope.generateUidIdentifier();

          path.traverse({
            VariableDeclarator(path) {
              const symbol = path.node.id.name;
              const safeSymbol = newScope.generateUidIdentifier();
              path.scope.rename(symbol, safeSymbol.name);
            },
            ReturnStatement(path) {
              path.replaceWithMultiple([
                ExpressionStatement(
                  AssignmentExpression(
                    '=',
                    newName,
                    path.node.argument
                  )
                ),
                BreakStatement(label)
              ]);
            }

          })

          const index = use.parentPath.getStatementParent().key;

          use.parentPath.getStatementParent().container
            .splice(index, 0,
              VariableDeclaration(
                'let',
                [
                  VariableDeclarator(newName)
                ]
              )
            );

          const array = use.parentPath.getStatementParent().container;
          array.splice(index + 1, 0,
            LabeledStatement(
              label,
              path.node.body
            )
          );

          path.remove();
          use.parentPath.replaceWith(newName);
        }

      }
    }
  };
}
