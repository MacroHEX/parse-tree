import {FormEvent, useEffect, useRef, useState} from 'react';
import {ConstantNode, MathNode, OperatorNode, parse} from 'mathjs';
import * as d3 from 'd3';

import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";

interface TreeNode {
  value: string;
  left?: TreeNode;
  right?: TreeNode;
  isSubExpression?: boolean;
}

interface ExtendedMathNode extends MathNode {
  content?: MathNode;
}

function App() {
  const [expression, setExpression] = useState('');
  const [tree, setTree] = useState<TreeNode | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  /**
   * Parses the given expression and returns a tree representation of it.
   * @param {string} expression - The mathematical expression to be parsed.
   * @returns {TreeNode | null} A tree representation of the parsed expression, or null if the expression is invalid.
   */
  const parseExpression = (expression: string): TreeNode | null => {
    try {
      const node = parse(expression);
      return convertToTree(node);
    } catch (error) {
      console.error('Invalid expression:', error);
      return null;
    }
  };

  /**
   * Converts a parsed MathNode into a TreeNode representation.
   * @param {MathNode} node - The parsed MathNode to be converted.
   * @param {boolean} [isSubExpression=false] - Whether the node is a sub-expression.
   * @returns {TreeNode} A TreeNode representation of the parsed MathNode.
   */
  const convertToTree = (node: MathNode, isSubExpression: boolean = false): TreeNode => {
    switch (node.type) {
      case 'OperatorNode': {
        const operatorNode = node as OperatorNode;
        return {
          value: operatorNode.op,
          left: operatorNode.args ? convertToTree(operatorNode.args[0], isSubExpression) : undefined,
          right: operatorNode.args ? convertToTree(operatorNode.args[1], isSubExpression) : undefined,
          isSubExpression
        };
      }
      case 'ConstantNode': {
        const constantNode = node as ConstantNode;
        return {
          value: constantNode.value.toString(),
          isSubExpression
        };
      }
      case 'ParenthesisNode': {
        const contentNode = node as ExtendedMathNode;
        return convertToTree(contentNode.content!, true);
      }
      default:
        throw new Error('Unsupported node type: ' + node.type);
    }
  };

  const preprocessExpression = (expr: string) => {
    return expr
      .replace(/\{/g, '(')  // Replace { with (
      .replace(/\[/g, '(')  // Replace [ with (
      .replace(/}/g, ')')  // Replace } with )
      .replace(/]/g, ')')  // Replace ] with )
      .replace(/(\d+)(\s*\()/g, '$1 * $2')  // Add * between a number and a parenthesis
      .replace(/(\))(\s*\d+)/g, '$1 * $2')  // Add * between a parenthesis and a number
      .replace(/(–)/g, '-');  // Replace – with -
  };


  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const processedExpression = preprocessExpression(expression);
    const treeData = parseExpression(processedExpression);
    setTree(treeData);
  };

  useEffect(() => {
    if (tree && containerRef.current) {
      const container = d3.select(containerRef.current);
      container.selectAll('*').remove(); // Clear the previous svg
      drawTree(tree);
    }
  }, [tree]);


  /**
   * Draws the tree representation of a parsed expression.
   * @param {TreeNode} treeData - The tree representation of the parsed expression.
   */
  const drawTree = (treeData: TreeNode) => {
    const width = 800;
    const height = 500;
    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate(100,40)');

    const treemap = d3.tree<TreeNode>().size([width - 200, height - 100]);
    const root = d3.hierarchy(treeData, d => {
      return [d.left, d.right].filter((child): child is TreeNode => child !== undefined);
    });
    treemap(root);

    // Draw links
    svg.selectAll(".link")
      .data(root.links())
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5)
      .attr("x1", d => d.source.x!)
      .attr("y1", d => d.source.y!)
      .attr("x2", d => d.target.x!)
      .attr("y2", d => d.target.y!);

    // Draw nodes with different shapes based on node type
    const nodeEnter = svg.selectAll('g.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    nodeEnter.each(function (d) {
      const node = d3.select(this);
      if (isNaN(+d.data.value)) {  // Check if the value is an operator
        node.append('circle')
          .attr('r', 15)
          .attr("fill", "#3eafff");
      } else {  // It's a number
        node.append('rect')
          .attr('x', -10)  // Centers the rectangle
          .attr('y', -10)  // Centers the rectangle
          .attr('width', 20)
          .attr('height', 20)
          .attr("fill", "#12ffdb");
      }
      node.append('text')
        .attr('dy', '.35em')
        .attr("text-anchor", "middle")
        .text(d.data.value);
    });
  };
  return (
    <div className='flex'>
      <div className='min-h-[100dvh] w-full'>
        <div className='flex gap-x-5'>
          <div className='flex flex-1 h-screen justify-center items-center'>
            <Card className='w-full md:m-40 m-10 drop-shadow-xl border-2'>
              <CardHeader>
                <CardTitle>Generador de Árbol Sintáctico</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="math">Operación a Analizar</Label>
                      <Input id="math" value={expression} onChange={(e) => setExpression(e.target.value)}
                             placeholder="(2+3)*(10-5)"/>
                      <Button type="submit">Generar Árbol</Button>
                    </div>
                  </div>
                  <div ref={containerRef} className="mt-4"/>
                </form>
              </CardContent>
              <CardFooter>
                <p className='text-xs'>Implementación por Martín Medina</p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
