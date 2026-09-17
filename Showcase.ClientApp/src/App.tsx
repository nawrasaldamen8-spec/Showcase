import React, { useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  ConfirmationDialog,
  DescriptionItem,
  DescriptionList,
  Drawer,
  EmptyState,
  ErrorState,
  Form,
  FormDescription,
  FormGroup,
  Heading,
  Image,
  Input,
  Link,
  List,
  ListItem,
  Modal,
  Skeleton,
  Spinner,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
  Textarea,
  ToastProvider,
  useToast,
} from "./components/ui/index.ts";

const DemoContent: React.FC = () => {
  const { toast } = useToast();

  // State for interactive overlays
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Form states
  const [isFeatured, setIsFeatured] = useState(true);
  const [isRead, setIsRead] = useState(false);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError("Name is required!");
      toast({
        title: "Validation Error",
        description: "Please enter your name before submitting.",
        type: "error",
      });
      return;
    }
    setNameError("");
    toast({
      title: "Success",
      description: `Form submitted successfully for ${name}!`,
      type: "success",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <Avatar name="Nawras Aldamen" size="lg" />
            <div>
              <Heading level={2}>Showcase UI Component Library</Heading>
              <Text variant="muted">Core UI Primitives & Shared Patterns from Global UI Inventory</Text>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="featured">v1.0 Ready</Badge>
            <Badge variant="unread">Active Preview</Badge>
          </div>
        </header>

        {/* 1. Typography & Badges & Avatars */}
        <section className="space-y-4">
          <Heading level={3}>1. Typography, Badges & Avatars</Heading>
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Heading level={4}>Typography Primitives</Heading>
                <Text variant="lead">This is a lead paragraph displaying clean typography and layout hierarchy.</Text>
                <Text variant="body">
                  Standard body text using Tailwind CSS tokens. You can also use inline{" "}
                  <Text variant="code">code primitives</Text> or <Text variant="muted">muted explanations</Text>.
                </Text>
              </div>

              <div className="space-y-2">
                <Text variant="small" className="font-semibold uppercase tracking-wider text-slate-500">
                  Badges
                </Text>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="featured">Featured Item</Badge>
                  <Badge variant="unread">Unread (1)</Badge>
                  <Badge variant="read">Read</Badge>
                  <Badge variant="success">Published</Badge>
                  <Badge variant="warning">Draft</Badge>
                  <Badge variant="danger">Archived</Badge>
                  <Badge variant="outline">Custom Tag</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Text variant="small" className="font-semibold uppercase tracking-wider text-slate-500">
                  Avatars & Links
                </Text>
                <div className="flex items-center gap-4">
                  <Avatar size="sm" name="Alex Doe" />
                  <Avatar size="md" name="Sara Connor" />
                  <Avatar size="lg" name="Tech Lead" />
                  <Link href="https://github.com" isExternal variant="primary">
                    GitHub Profile
                  </Link>
                  <Link href="#internal" variant="muted">
                    Internal Link
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 2. Buttons & Actions */}
        <section className="space-y-4">
          <Heading level={3}>2. Buttons & Actions</Heading>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="destructive">Delete Item</Button>
                <Button variant="ghost">Ghost Action</Button>
                <Button variant="primary" isLoading>
                  Loading
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 3. Form Controls & Validation */}
        <section className="space-y-4">
          <Heading level={3}>3. Form & Validation Controls</Heading>
          <Card>
            <CardHeader>
              <CardTitle>Contact / Item Editor Form</CardTitle>
              <CardDescription>Demonstrating Input, Textarea, Switch, and validation feedback.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form onSubmit={handleFormSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormGroup>
                    <Input
                      label="Full Name"
                      placeholder="e.g. John Doe"
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (nameError) setNameError("");
                      }}
                      error={nameError}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Input
                      label="Item URL / Image Link"
                      placeholder="https://example.com/item"
                      helperText="Paste direct external link"
                    />
                  </FormGroup>
                </div>

                <FormGroup>
                  <Textarea label="Description / Bio" placeholder="Provide detailed description..." rows={3} />
                  <FormDescription>Max 500 characters recommended.</FormDescription>
                </FormGroup>

                <div className="flex flex-col sm:flex-row gap-6 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Switch
                    checked={isFeatured}
                    onChange={setIsFeatured}
                    label="Featured Item"
                    description="Highlight this project on the showcase homepage"
                  />
                  <Switch
                    checked={isRead}
                    onChange={setIsRead}
                    label="Mark as Read"
                    description="Toggle read status for message"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" variant="primary">
                    Submit With Validation
                  </Button>
                </div>
              </Form>
            </CardContent>
          </Card>
        </section>

        {/* 4. Data Display Patterns: Card, DescriptionList, Table & List */}
        <section className="space-y-4">
          <Heading level={3}>4. Data Display Patterns</Heading>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DescriptionList */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>DescriptionList Key-Value Presentation</CardDescription>
              </CardHeader>
              <CardContent>
                <DescriptionList>
                  <DescriptionItem label="Full Name" value="Nawras Aldamen" />
                  <DescriptionItem label="Title" value="Fullstack Engineer" />
                  <DescriptionItem label="Location" value="Amman, Jordan" />
                  <DescriptionItem label="Status" value={<Badge variant="success">Available for Hire</Badge>} />
                </DescriptionList>
              </CardContent>
            </Card>

            {/* Image Preview Card */}
            <Card hoverable>
              <CardContent className="pt-6 space-y-4">
                <Image
                  src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"
                  alt="Code Editor"
                  aspectRatio="video"
                />
                <div>
                  <Heading level={4}>Showcase Item Preview</Heading>
                  <Text variant="muted" className="mt-1">
                    Card container with hoverable shadow and image preview primitive.
                  </Text>
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <Badge variant="featured">Featured</Badge>
                <Button variant="outline" size="sm">
                  View Project
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Table */}
          <div className="space-y-2">
            <Text variant="small" className="font-semibold uppercase tracking-wider text-slate-500">
              Table Pattern
            </Text>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Title</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Antigravity Portfolio</TableCell>
                  <TableCell>1</TableCell>
                  <TableCell>
                    <Badge variant="featured">Featured</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Clean Architecture API</TableCell>
                  <TableCell>2</TableCell>
                  <TableCell>
                    <Badge variant="default">Standard</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* List */}
          <div className="space-y-2">
            <Text variant="small" className="font-semibold uppercase tracking-wider text-slate-500">
              List Pattern
            </Text>
            <List>
              <ListItem clickable>
                <div>
                  <p className="font-medium">GitHub Repository</p>
                  <p className="text-xs text-slate-500">github.com/nawrasaldamen</p>
                </div>
                <Badge variant="outline">Social</Badge>
              </ListItem>
              <ListItem clickable active>
                <div>
                  <p className="font-medium">LinkedIn Network</p>
                  <p className="text-xs text-slate-500">linkedin.com/in/nawras</p>
                </div>
                <Badge variant="success">Active</Badge>
              </ListItem>
            </List>
          </div>
        </section>

        {/* 5. Modals, Drawers & Notification Dialogs */}
        <section className="space-y-4">
          <Heading level={3}>5. Modals, Drawers & Dialogs</Heading>
          <Card>
            <CardHeader>
              <CardTitle>Interactive Overlays & Notifications</CardTitle>
              <CardDescription>
                Click buttons to test modal dialogs, slide-in drawer panels, and toasts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => setIsModalOpen(true)} variant="primary">
                  Open Modal
                </Button>
                <Button onClick={() => setIsDrawerOpen(true)} variant="secondary">
                  Open Drawer
                </Button>
                <Button onClick={() => setIsConfirmOpen(true)} variant="destructive">
                  Open Confirmation Dialog
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    toast({
                      title: "Notification",
                      description: "Here is a toast notification alert!",
                      type: "info",
                    })
                  }
                >
                  Trigger Toast
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 6. States: Empty, Loading, Error */}
        <section className="space-y-4">
          <Heading level={3}>6. UI States (Empty, Loading, Error)</Heading>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <EmptyState
              title="No Messages Yet"
              description="Contact messages received from the showcase page will appear here."
              action={
                <Button size="sm" variant="outline">
                  Refresh Inbox
                </Button>
              }
            />

            <Card>
              <CardHeader>
                <CardTitle>Loading States</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center">
                  <Spinner size="md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>

            <ErrorState
              title="Failed to fetch data"
              message="Could not reach the showcase backend API service."
              onRetry={() =>
                toast({
                  title: "Retrying...",
                  description: "Attempting to reconnect to backend.",
                  type: "info",
                })
              }
            />
          </div>
        </section>

        {/* Interactive Overlays Rendering */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Showcase Item"
          description="Fill out the details below to add a project to your showcase."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsModalOpen(false);
                  toast({
                    title: "Item Created",
                    description: "Your item was successfully added.",
                    type: "success",
                  });
                }}
              >
                Save Item
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <Input label="Title" placeholder="Project Name" />
            <Input label="Link" placeholder="https://..." />
            <Textarea label="Summary" placeholder="Short description..." />
          </div>
        </Modal>

        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title="Edit Profile Information"
          description="Update your personal details without losing your place."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsDrawerOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsDrawerOpen(false);
                  toast({
                    title: "Profile Updated",
                    description: "Profile changes have been saved.",
                    type: "success",
                  });
                }}
              >
                Apply Changes
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input label="Full Name" defaultValue="Nawras Aldamen" />
            <Input label="Professional Title" defaultValue="Senior Fullstack Developer" />
            <Input label="Location" defaultValue="Amman, Jordan" />
            <Textarea label="Bio" defaultValue="Passionate software craftsman..." />
          </div>
        </Drawer>

        <ConfirmationDialog
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={() => {
            setIsConfirmOpen(false);
            toast({
              title: "Item Deleted",
              description: "The item has been deleted successfully.",
              type: "warning",
            });
          }}
          title="Delete Showcase Item?"
          description="Are you sure you want to delete this item? This action cannot be undone."
          confirmText="Yes, Delete"
        />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <DemoContent />
    </ToastProvider>
  );
}
