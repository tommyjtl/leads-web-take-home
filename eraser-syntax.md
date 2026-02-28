## 

Nodes

[](https://docs.eraser.io/docs/syntax#nodes)

A node is the most basic building block in a cloud architecture diagram.

Node definitions consist of a name followed by an optional set of properties. For example, `compute` is the name of below node and it has an `icon` property which is set to `aws-ec2`.

`compute [icon: aws-ec2]`

![](https://files.readme.io/2211d42-image.png)

Node names are required to be unique.

Nodes support `icon` and `color` properties.

## 

Groups

[](https://docs.eraser.io/docs/syntax#groups)

A group is a container that can encapsulate nodes and groups.

Group definitions consist of a name followed by `{ }`. For example, `Main Server` is the name of the below group and it contains `Server` and `Data` nodes.

  `Main Server {     Server [icon: aws-ec2]     Data [icon: aws-rds]   }`

![](https://files.readme.io/e4e565d-image.png)

Group names are required to be unique.

Groups can be nested. In the below example, `VPC Subnet` group contains `Main Server group`.

`VPC Subnet {   Main Server {     Server [icon: aws-ec2]     Data [icon: aws-rds]   } }`

![](https://files.readme.io/71f3972-image.png)

Groups support `icon` and `color` properties.

## 

Properties

[](https://docs.eraser.io/docs/syntax#properties)

Properties are key-value pairs enclosed in `[ ]` brackets that can be appended to definitions of nodes and groups. Properties are optional.

It is possible to set multiple properties like shown below:

  `Main Server [icon: aws-ec2, color: blue] {     Server [icon: aws-ec2]     Data [icon: aws-rds]   }`

![](https://files.readme.io/757ac9f-image.png)

Here are the properties that are allowed:

|Property|Description|Value|Default value|
|---|---|---|---|
|`icon`|Attached icons|Icon names (e.g. `aws-ec2`). See [Icons](https://docs.eraser.io/docs/icons) page for full list.||
|`color`|Stroke and fill color|Color name (e.g. `blue`) or hex code (e.g. `"#000000"`- note the quote marks for hex codes)||
|`label`|Text label|Any string. Enclose in double quotes (e.g. `"Main Server"`) if containing a space. Allows multiple nodes and groups to have the same `label`.|Name of node or group|
|`link`|Internal or external link|A fully fledged URL. Enclose in double quotes (e.g. "[https://my-internal-docs.io/api-docs](https://my-internal-docs.io/api-docs)". Supports the full gamut of external links and Eraser-specific links: diagrams, headers, and files in Eraser.||
|`colorMode`|Fill color lightness|`pastel`, `bold`, `outline`|`pastel`|
|`styleMode`|Embellishments|`shadow`, `plain`, `watercolor`|`shadow`|
|`typeface`|Text typeface|`rough`, `clean`, `mono`|`rough`|

Here are the lists of icon names:

- [AWS Icons](https://docs.eraser.io/docs/icons#aws-icons)
- [Google Cloud Icons](https://docs.eraser.io/docs/icons#google-cloud-icons)
- [Azure Icons](https://docs.eraser.io/docs/icons#azure-icons)
- [Tech Logos](https://docs.eraser.io/docs/icons#tech-logos)
- [General Icons](https://docs.eraser.io/docs/icons#general-icons)

The `label` property is useful if you want the node's (or group's) label and name to be distinct. By default, the `label` is set as the node name. But because node names are required to be distinct, you will need to use the `label` property if you have two nodes with the exact same label.

`// Names need to be distinct, but labels can overlap Server_A [label: server] Server_B [label: server]`

Refer to [Styling](https://docs.eraser.io/docs/styling) for more details and examples on the `colorMode`, `styleMode`, and `typeface` properties.

It is possible to set multiple properties by separating them using `,` like shown below:

`Server [icon: server, typeface: mono]`

## 

Connections

[](https://docs.eraser.io/docs/syntax#connections)

Connections represent relationships between nodes and groups. They can be created between nodes, between groups, and between nodes and groups.

Here is an example of a connection between two nodes:

`Compute > Storage`

![](https://files.readme.io/439a719-image.png)

Here are the types of connectors:

|Connector|Syntax|Description|
|---|---|---|
|![](https://firebasestorage.googleapis.com/v0/b/second-petal-295822.appspot.com/o/images%2Fdocumentation%2Fleft-to-right-arrow.svg?alt=media&token=94bb3222-c6b9-45e9-8f5c-3ec3543dec51)|`>`|Left-to-right arrow|
|![](https://firebasestorage.googleapis.com/v0/b/second-petal-295822.appspot.com/o/images%2Fdocumentation%2Fright-to-left-arrow.svg?alt=media&token=d16d2ff3-cbc1-432a-861d-34fced0ecd3d)|`<`|Right-to-left arrow|
|![](https://firebasestorage.googleapis.com/v0/b/second-petal-295822.appspot.com/o/images%2Fdocumentation%2Fbi-directional-arrow.svg?alt=media&token=23d99864-fd7d-4d3e-a6fd-79dbbef3a21a)|`<>`|Bi-directional arrow|
|![](https://firebasestorage.googleapis.com/v0/b/second-petal-295822.appspot.com/o/images%2Fdocumentation%2Fline.svg?alt=media&token=732f1db0-c6bf-4dad-9f9a-ed6a3faefff6)|`-`|Line|
|![](https://firebasestorage.googleapis.com/v0/b/second-petal-295822.appspot.com/o/images%2Fdocumentation%2Fdotted-line.svg?alt=media&token=e6e51821-eb37-4a60-b4b2-368af04d4d2a)|`--`|Dotted line|
|![](https://firebasestorage.googleapis.com/v0/b/second-petal-295822.appspot.com/o/images%2Fdocumentation%2Fdotted-arrow.svg?alt=media&token=95be9757-70f2-4315-b18a-81afc9dfa094)|`-->`|Dotted arrow|

It is possible to add a label to a connection. Here is an example:

`Storage > Server: Cache Hit`

![](https://files.readme.io/d547532-Connection_labels.png)

It is possible to create it is possible to create one-to-many connections in a single statement. This is instead of creating separate one-to-one connections. Here is an example:

`Server > Worker1, Worker2, Worker3`

![](https://files.readme.io/cb51434-image.png)

If a connection statement contains a name that has not been previously defined as a node or a group, a blank node with that name will be created.

Here are the properties that are allowed on connections (lines):

|Property|Description|Example|
|---|---|---|
|`color`|Line color|`Storage > Server: Cache Hit [color: green]`  <br>`Storage > Server: [color: green]`|

## 

Icons

[](https://docs.eraser.io/docs/syntax#icons)

Here's a [list of all the icons you can use with diagram-as-code](https://docs.eraser.io/docs/icons).

## 

Escape string

[](https://docs.eraser.io/docs/syntax#escape-string)

Certain characters are not allowed in node and group names because they are reserved. You can use these characters, you can wrap the entire node or group name in quotes `" "`.

`User > "https://localhost:8080": GET`

## 

Direction

[](https://docs.eraser.io/docs/syntax#direction)

The direction of the cloud architecture diagram can be changed using the `direction` statement. Allowed directions are:

- `direction down`
- `direction up`
- `direction right` (default)
- `direction left`

The direction statement can be placed anywhere in the code like this:

`direction down`

## 

Styling

[](https://docs.eraser.io/docs/syntax#styling)

Styles can be applied at the diagram level. Below is an overview of the options and syntax. Refer to [Styling](https://docs.eraser.io/docs/styling) for more details and examples.

|Property|Values|Default value|Syntax example|
|---|---|---|---|
|`colorMode`|`pastel`, `bold`, `outline`|`pastel`|`colorMode bold`|
|`styleMode`|`shadow`, `plain`, `watercolor`|`shadow`|`styleMode shadow`|
|`typeface`|`rough`, `clean`, `mono`|`rough`|`typeface clean`|

## 

Legends

[](https://docs.eraser.io/docs/syntax#legends)

Legends map a swatch (connection, icon, shape, or color) to a label. Swatches are not tied to actual elements in the diagram.

 `legend {                                             [connection: -->, label: Async]                 [color: red, label: Error]     [icon: aws-lambda, label: Lambda]     [shape: diamond, label: Decision]   }`

### 

Legend properties

[](https://docs.eraser.io/docs/syntax#legend-properties)

|Property|Description|Value|Default Value|
|---|---|---|---|
|position|Position of the legend on the canvas|Position names (e.g. `top-left` or `right`)|`top-right`|

  `legend [position: bottom-left] {       [color: red, label: Error]     }`

Here is the list of positions:

`top-left`, `top-right` (default), `bottom-left`, `bottom-right`, `top`, `bottom`, `left`, `right`

### 

Legend item properties

[](https://docs.eraser.io/docs/syntax#legend-item-properties)

Each legend item is enclosed in `[ ]` and must include a `label` and at least one swatch property.

|Property|Description|Value|
|---|---|---|
|label|Text label|Any string. Enclose in double quotes if containing a space.|
|connection|Connection swatch|Connection types (e.g. `-->` or `<>`). See Connections above.|
|color|Color swatch|Color name (e.g. `blue`) or hex code (e.g. `"#000000"`)|
|icon|Icon swatch|Icon names (e.g. `aws-ec2`). See Icons page for full list.|
|shape|Shape swatch|Shape names (e.g. `diamond` or `oval`).|

`color` can be combined with `connection` or `shape`. Other swatch types are mutually exclusive.

`legend {       [connection: -->, color: orange, label: Async backup]       [shape: rectangle, color: blue, label: Active]   }`