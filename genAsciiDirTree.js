const output = content =>
    (document.getElementById("screen-output").innerHTML = content);

const isLeaf = sth =>
    Boolean(
        typeof sth === "string" ||
        !(typeof sth === "object" && sth.children && sth.children.length)
    );
const isLeaves = (...treeObjs) =>
    treeObjs.reduce((result, tree) => result && isLeaf(tree), true);

const genBranch = (branchChar = "_", branchLen = 2, mode = "h") => {
    let branchStr = String(branchChar).repeat(branchLen);
    switch (mode) {
        case "h":
            return branchStr;
        case "v":
            return branchStr.split("").join("\n");
    }
};

const insertBefore = (str, toInsert, skip, num) => {
    return String(str)
        .split("\n")
        .map((node, index, arr) => {
            let insertTimes = skip === "start" ? num : num - 1;
            if (index === 0) {
                return skip === "start" ? node : toInsert + node;
            }
            if (num && index >= insertTimes) {
                return " ".repeat(toInsert.length) + node;
            }
            if (index === arr.length - 1) {
                return skip === "end" ? node : toInsert + node;
            }
            return toInsert + node;
        })
        .join("\n");
};
const addBlankLine = strArr => strArr.join("\n\n");
const addHBranch = (str, branchLen) => genBranch("_", branchLen, "h") + str;
const indent = (str, indentLen) =>
    insertBefore(str, " ".repeat(indentLen), "start");

const joinNodeName = (nodeName, str) => nodeName + str;

// 暂时不支持 compose 深度不同的树
const compose = (nodeName, isLeafStr, opt={
    NF: function (nodeName) {
        return nodeName;
    },
    LF: function (leafName) {
        return leafName;
    }
}, ...trees) => {
    let nameArr = trees.map(tree => (isLeafStr ? addHBranch(tree, 2) : tree));
    let formatter = isLeafStr ? opt.LF : opt.NF;
    let allButLast = trees
        .slice(0, trees.length - 1)
        .join("\n")
        .split("\n");
    let retNum = allButLast.length + trees.length;
    return indent(
        "__" +
        joinNodeName(
            formatter(nodeName),
            indent(
                insertBefore(addBlankLine(nameArr), "|", "start", retNum),
                nodeName.length - 1
            )
        ),
        2
    );
};

const genTree = (tree, opt) => {
    if (isLeaves(tree)) {
        return compose(tree.name, true, opt, ...tree.children.map(t => t.name));
    } else {
        return compose(tree.name, false, opt, ...tree.children.map(tree => genTree(tree, opt)));
    }
};

const genAsciiTree = (tree, opt) => genTree(tree, opt).replace("__", "  ");

export default genAsciiTree;
