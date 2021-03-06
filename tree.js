/*
 *      JavaScript Quad-tree implementation for CommonJS
 *      David Arthur, 2010
 */
var sys = require('sys');

/* Global counters */
var node_id = 0;
var pt_id = 0;

function QuadtreeNode(xmin, xmax, ymin, ymax){
    /* Class for the tree nodes */
    this.id = ++node_id;
    this.xmin = xmin;
    this.xmax = xmax;
    this.ymin = ymin;
    this.ymax = ymax;
    this.isLeaf = true;
    this.nodes = [];
    this.points = [];
    this.intersect = function(x, y){
	return (x >= this.xmin && x < this.xmax) && (y >= this.ymin && y < this.ymax);
    };
}
function QuadTree(config){
    /*
     * Class for the tree interface.
     * @param config: An object with the following optional properties
     *    xmin : the minimum x coordinate of the region
     *    xmax : the maximum x coordinate of the region
     *    ymin : the minimum y coordinate of the region
     *    ymax : the maximum y coordinate of the region
     *    max_pts : maximum number of points to store in a leaf node
     *    max_depth : maximum depth of the tree
     *
     * Note that max_depth overrides max_pts. If you run out of depth and there
     * are still points to be added, they will just fill up the leaf nodes.
     */
    this.subdivide = function(node){
	/* Given a node, create and return four sub-quadrants */
	var nodes = [];
	var dx = node.xmax-node.xmin;
	var dy = node.ymax-node.ymin;
	nodes[0] = new QuadtreeNode(node.xmin, node.xmax-dx/2, node.ymin, 
            node.ymax-dy/2);
	nodes[1] = new QuadtreeNode(node.xmax-dx/2, node.xmax, node.ymin, 
            node.ymax-dy/2);
	nodes[2] = new QuadtreeNode(node.xmin, node.xmax-dx/2, node.ymax-dy/2, 
            node.ymax);
	nodes[3] = new QuadtreeNode(node.xmax-dx/2, node.xmax, node.ymax-dy/2,
            node.ymax);
	return nodes;
    }
    this.update = function(x, y, ref){

    }
    this.insert = function(x, y, ref, node){	
	/* Load a point into the tree. If node is given, start traversing at
	 * that position in the tree. 
	 */
        node = traverse(x, y, this);
	if(node.points.length+1 > MAX_PTS){
	    if(node.depth+1 > MAX_DEPTH){
		node.points.push({x:x, y:y, ref:ref});
                ref.tree_ref = node;
	    }
	    else{
		var points_ = node.points;
		points_.push({x:x, y:y, ref:ref});
		var nodes_ = this.subdivide(node);
		for(var i=0;i<4;i++)
		    nodes_[i].depth = node.depth+1;
		node.nodes = nodes_;
		node.points = [];
		node.isLeaf = false;
		for(var i=0;i<points_.length;i++)
		    this.insert(points_[i].x, points_[i].y, points_[i].ref, node);
	    }
	}
	else{
	    node.points.push({x:x, y:y, ref:ref});
            ref.tree_ref = node;
        }
    }
    this.print = function(){
        pprint(this);   
    };
    function traverse(x, y, node){
	/* Traverse the tree looking for the correct node for a point */
	do {
	    for(var i=0;i<4;i++)
		if(node.nodes[i].intersect(x, y)){
		    node = node.nodes[i];
		    break;
		}
	} while(node.isLeaf == false)
        return node;
    }
    var MAX_DEPTH = config.max_depth || 10;
    var MAX_PTS = config.max_pts || 20;
    this.xmin = config.xmin || 0;
    this.xmax = config.xmax || 100;
    this.ymin = config.ymin || 0;
    this.ymax = config.ymax || 100;
    this.id = ++node_id;
    this.nodes = this.subdivide(this);
    for(var i=0;i<4;i++)
	this.nodes[i].depth = 1;
}

function pprint(node){
    function _pprint(node, pre){
	if(!pre)
	    pre = ' ';
	var out = '';
	out += '['+node.id+']\n';
	if(node.isLeaf){
	    for(var i=0;i<node.points.length;i++){
                out += pre+'[+'+node.points[i].ref.id+']';
                out += ' ('+node.points[i].x+','+node.points[i].y+')\n';
            }
	}
	else{
	    out += pre+_pprint(node.nodes[0],' '+pre)+'\n';
	    out += pre+_pprint(node.nodes[1],' '+pre)+'\n';
	    out += pre+_pprint(node.nodes[2],' '+pre)+'\n';
	    out += pre+_pprint(node.nodes[3],' '+pre)+'\n';
	}
	return out;
    }
    sys.puts(_pprint(node));
}

exports.QuadTree = QuadTree;
