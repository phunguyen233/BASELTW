import { useEffect, useState } from 'react';
import {
  Tabs,
  Card,
  Input,
  Tag,
  Pagination,
  Table,
  Button,
  Form,
  Modal,
  Select,
  Popconfirm,
  message,
  Empty,
  Row,
  Col,
  Avatar,
  Divider,
  Statistic,
} from 'antd';
import { marked } from 'marked';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

// ================= TYPES =================
interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  thumbnail: string;
  tags: string[];
  status: 'draft' | 'published';
  views: number;
  createdAt: string;
  author: string;
}

interface TagType {
  name: string;
  id: string;
}

interface AuthorInfo {
  name: string;
  avatar: string;
  bio: string;
  skills: string[];
  social: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    email?: string;
  };
}

// ================= LOCAL STORAGE =================
const getPosts = (): Post[] =>
  JSON.parse(localStorage.getItem('blog_posts') || '[]');

const savePosts = (posts: Post[]) =>
  localStorage.setItem('blog_posts', JSON.stringify(posts));

const getTags = (): TagType[] =>
  JSON.parse(localStorage.getItem('blog_tags') || '[]');

const saveTags = (tags: TagType[]) =>
  localStorage.setItem('blog_tags', JSON.stringify(tags));

const getAuthorInfo = (): AuthorInfo =>
  JSON.parse(
    localStorage.getItem('blog_author') ||
      JSON.stringify({
        name: 'Phú Nguyễn',
        avatar: 'https://i.pravatar.cc/150?img=1',
        bio: 'Full Stack Developer | React | TypeScript | Node.js',
        skills: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Docker'],
        social: {
          github: 'https://github.com',
          twitter: 'https://twitter.com',
          linkedin: 'https://linkedin.com',
          email: 'phu@example.com',
        },
      })
  );

const saveAuthorInfo = (info: AuthorInfo) =>
  localStorage.setItem('blog_author', JSON.stringify(info));

// ================= APP =================
const BlogApp = () => {
  const [posts, setPosts] = useState<Post[]>(getPosts());
  const [tags, setTags] = useState<TagType[]>(getTags());
  const [authorInfo] = useState<AuthorInfo>(getAuthorInfo());

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [search, setSearch] = useState('');
  const [debounceSearch, setDebounceSearch] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [form] = Form.useForm();
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<TagType | null>(null);
  const [isTagModalVisible, setIsTagModalVisible] = useState(false);
  const [tagForm] = Form.useForm();

  // ================= DEBOUNCE =================
  useEffect(() => {
    const t = setTimeout(() => setDebounceSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // ================= SAVE TO LOCALSTORAGE =================
  useEffect(() => savePosts(posts), [posts]);
  useEffect(() => saveTags(tags), [tags]);
  useEffect(() => saveAuthorInfo(authorInfo), [authorInfo]);

  // ================= FILTER =================
  const filteredPosts = posts.filter((p) => {
    return (
      p.status === 'published' &&
      (!debounceSearch ||
        p.title.toLowerCase().includes(debounceSearch.toLowerCase())) &&
      (!filterTag || p.tags.includes(filterTag))
    );
  });

  const managePosts = posts.filter((p) => {
    return (
      (!debounceSearch ||
        p.title.toLowerCase().includes(debounceSearch.toLowerCase())) &&
      (!filterStatus || p.status === filterStatus)
    );
  });

  const paginated = filteredPosts.slice((page - 1) * 9, page * 9);
  const managePageSize = 10;
  const managePaginated = managePosts.slice(
    (page - 1) * managePageSize,
    page * managePageSize
  );

  // ================= CRUD OPERATIONS =================
  const addPost = (values: any) => {
    if (editingPost) {
      const updated = posts.map((p) =>
        p.id === editingPost.id ? { ...p, ...values } : p
      );
      setPosts(updated);
      message.success('Cập nhật bài viết thành công!');
    } else {
      const newPost: Post = {
        ...values,
        id: Date.now(),
        views: 0,
        createdAt: new Date().toLocaleString('vi-VN'),
        author: authorInfo.name,
      };
      setPosts([...posts, newPost]);
      message.success('Thêm bài viết thành công!');
    }
    setIsModalVisible(false);
    form.resetFields();
    setEditingPost(null);
  };

  const deletePost = (id: number) => {
    setPosts(posts.filter((p) => p.id !== id));
    message.success('Xóa bài viết thành công!');
  };

  const increaseView = (post: Post) => {
    const updated = posts.map((p) =>
      p.id === post.id ? { ...p, views: p.views + 1 } : p
    );
    setPosts(updated);
  };

  const openEditModal = (post: Post) => {
    setEditingPost(post);
    form.setFieldsValue(post);
    setIsModalVisible(true);
  };

  const addTag = (values: any) => {
    if (editingTag) {
      const updated = tags.map((t) =>
        t.id === editingTag.id ? { ...values, id: t.id } : t
      );
      setTags(updated);
      message.success('Cập nhật thẻ thành công!');
    } else {
      const newTag: TagType = {
        ...values,
        id: Date.now().toString(),
      };
      setTags([...tags, newTag]);
      message.success('Thêm thẻ thành công!');
    }
    setIsTagModalVisible(false);
    tagForm.resetFields();
    setEditingTag(null);
  };

  const deleteTag = (id: string) => {
    setTags(tags.filter((t) => t.id !== id));
    setPosts(
      posts.map((p) => ({
        ...p,
        tags: p.tags.filter((tag) => {
          const tagObj = tags.find((t) => t.id === id);
          return tag !== tagObj?.name;
        }),
      }))
    );
    message.success('Xóa thẻ thành công!');
  };

  const getTagUsageCount = (tagName: string): number => {
    return posts.filter((p) => p.tags.includes(tagName)).length;
  };

  const getRelatedPosts = (post: Post): Post[] => {
    return posts
      .filter(
        (p) =>
          p.id !== post.id &&
          p.status === 'published' &&
          p.tags.some((tag) => post.tags.includes(tag))
      )
      .slice(0, 3);
  };

  // ================= UI =================
  return (
    <div style={{ padding: '20px' }}>
      <Tabs defaultActiveKey="1" size="large">
        {/* ================= HOME ================= */}
        <TabPane tab=" Trang chủ" key="1">
          <div style={{ marginBottom: 20 }}>
            <Input.Search
              placeholder="Tìm kiếm bài viết..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              size="large"
              style={{ marginBottom: 16 }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <span style={{ marginRight: 8 }}>Tags:</span>
            {tags.map((t) => (
              <Tag
                key={t.id}
                onClick={() => {
                  setFilterTag(filterTag === t.name ? null : t.name);
                  setPage(1);
                }}
                style={{
                  cursor: 'pointer',
                  padding: '4px 12px',
                  backgroundColor: filterTag === t.name ? '#1890ff' : '#fafafa',
                  color: filterTag === t.name ? '#fff' : '#000',
                }}
              >
                {t.name} ({getTagUsageCount(t.name)})
              </Tag>
            ))}
            {tags.length === 0 && <Empty description="Chưa có thẻ nào" />}
          </div>

          <Row gutter={[16, 16]}>
            {paginated.length > 0 ? (
              paginated.map((p) => (
                <Col xs={24} sm={12} lg={8} key={p.id}>
                  <Card
                    hoverable
                    cover={<img alt={p.title} src={p.thumbnail} height={200} />}
                    onClick={() => {
                      setSelectedPost(p);
                      increaseView(p);
                    }}
                  >
                    <Card.Meta
                      title={p.title}
                      description={new Date(p.createdAt).toLocaleDateString('vi-VN')}
                    />
                    <p style={{ color: '#666', fontSize: 12, marginTop: 8 }}>
                      {p.content.slice(0, 60)}...
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {p.tags.map((t) => (
                        <Tag key={t}>
                          {t}
                        </Tag>
                      ))}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                      👁️ {p.views} views | 👤 {p.author}
                    </div>
                  </Card>
                </Col>
              ))
            ) : (
              <Col xs={24}>
                <Empty description="Không tìm thấy bài viết nào" />
              </Col>
            )}
          </Row>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <Pagination
              current={page}
              pageSize={9}
              total={filteredPosts.length}
              onChange={setPage}
              showSizeChanger={false}
            />
          </div>
        </TabPane>

        {/* ================= DETAIL ================= */}
        <TabPane tab=" Chi tiết bài viết" key="2">
          {selectedPost ? (
            <div>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => setSelectedPost(null)}
                style={{ marginBottom: 20 }}
              >
                Quay lại
              </Button>

              <Card>
                <img
                  src={selectedPost.thumbnail}
                  alt={selectedPost.title}
                  style={{ width: '100%', maxHeight: 400, objectFit: 'cover', marginBottom: 20 }}
                />

                <h1>{selectedPost.title}</h1>

                <div style={{ marginBottom: 20, color: '#666' }}>
                  <span style={{ marginRight: 16 }}>👤 {selectedPost.author}</span>
                  <span style={{ marginRight: 16 }}>📅 {selectedPost.createdAt}</span>
                  <span>👁️ {selectedPost.views} views</span>
                </div>

                <div style={{ marginBottom: 20 }}>
                  {selectedPost.tags.map((t) => (
                    <Tag key={t} color="blue">
                      {t}
                    </Tag>
                  ))}
                </div>

                <Divider />

                <div
                  dangerouslySetInnerHTML={{
                    __html: marked(selectedPost.content),
                  }}
                  style={{
                    fontSize: 16,
                    lineHeight: 1.8,
                    color: '#333',
                  }}
                />

                <Divider />

                <div style={{ marginTop: 40 }}>
                  <h3>📝 Bài viết liên quan</h3>
                  <Row gutter={[16, 16]}>
                    {getRelatedPosts(selectedPost).length > 0 ? (
                      getRelatedPosts(selectedPost).map((p) => (
                        <Col xs={24} sm={12} lg={8} key={p.id}>
                          <Card
                            hoverable
                            cover={<img alt={p.title} src={p.thumbnail} height={150} />}
                            onClick={() => {
                              increaseView(p);
                              setSelectedPost(p);
                            }}
                          >
                            <Card.Meta
                              title={p.title}
                              description={p.content.slice(0, 40) + '...'}
                            />
                          </Card>
                        </Col>
                      ))
                    ) : (
                      <Col xs={24}>
                        <Empty description="Chưa có bài viết liên quan" />
                      </Col>
                    )}
                  </Row>
                </div>
              </Card>
            </div>
          ) : (
            <Empty description="Vui lòng chọn bài viết từ Trang chủ" />
          )}
        </TabPane>

        {/* ================= ABOUT ================= */}
        <TabPane tab=" Giới thiệu" key="3">
          <Card>
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                <Avatar src={authorInfo.avatar} size={200} />
              </Col>
              <Col xs={24} sm={16}>
                <h1>{authorInfo.name}</h1>
                <p style={{ fontSize: 16, marginBottom: 16 }}>{authorInfo.bio}</p>

                <div style={{ marginBottom: 20 }}>
                  <h3>Kỹ năng:</h3>
                  <div>
                    {authorInfo.skills.map((skill) => (
                      <Tag key={skill} color="blue" style={{ marginBottom: 8 }}>
                        {skill}
                      </Tag>
                    ))}
                  </div>
                </div>

                <div>
                  <h3>Liên kết:</h3>
                  {authorInfo.social.github && (
                    <div>
                      <a href={authorInfo.social.github} target="_blank" rel="noopener noreferrer">
                        GitHub
                      </a>
                    </div>
                  )}
                  {authorInfo.social.twitter && (
                    <div>
                      <a href={authorInfo.social.twitter} target="_blank" rel="noopener noreferrer">
                        Twitter
                      </a>
                    </div>
                  )}
                  {authorInfo.social.linkedin && (
                    <div>
                      <a href={authorInfo.social.linkedin} target="_blank" rel="noopener noreferrer">
                        LinkedIn
                      </a>
                    </div>
                  )}
                  {authorInfo.social.email && (
                    <div>
                      <a href={`mailto:${authorInfo.social.email}`}>Email</a>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </Card>
        </TabPane>

        {/* ================= ADMIN POST ================= */}
        <TabPane tab=" Quản lý bài viết" key="4">
          <div style={{ marginBottom: 20 }}>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Input.Search
                  placeholder="Tìm kiếm theo tiêu đề..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Select
                  placeholder="Lọc theo trạng thái"
                  allowClear
                  onChange={(value) => {
                    setFilterStatus(value);
                    setPage(1);
                  }}
                >
                  <Option value="draft">Nháp</Option>
                  <Option value="published">Đã đăng</Option>
                </Select>
              </Col>
              <Col xs={24} sm={6}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingPost(null);
                    form.resetFields();
                    setIsModalVisible(true);
                  }}
                  block
                >
                  Thêm bài
                </Button>
              </Col>
            </Row>
          </div>

          <Table
            dataSource={managePaginated}
            rowKey="id"
            pagination={{
              current: page,
              pageSize: managePageSize,
              total: managePosts.length,
              onChange: setPage,
            }}
            columns={[
              {
                title: 'Tiêu đề',
                dataIndex: 'title',
                width: 200,
              },
              {
                title: 'Trạng thái',
                dataIndex: 'status',
                render: (status) => (
                  <Tag color={status === 'published' ? 'green' : 'orange'}>
                    {status === 'published' ? 'Đã đăng' : 'Nháp'}
                  </Tag>
                ),
                width: 100,
              },
              {
                title: 'Thẻ',
                dataIndex: 'tags',
                render: (tags: string[]) => (
                  <>
                    {tags.map((tag) => (
                      <Tag key={tag}>
                        {tag}
                      </Tag>
                    ))}
                  </>
                ),
              },
              {
                title: 'Lượt xem',
                dataIndex: 'views',
                width: 80,
              },
              {
                title: 'Ngày tạo',
                dataIndex: 'createdAt',
                width: 150,
                render: (date) => new Date(date).toLocaleDateString('vi-VN'),
              },
              {
                title: 'Hành động',
                width: 120,
                render: (_, record) => (
                  <>
                    <Button
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => openEditModal(record as Post)}
                    />
                    <Popconfirm
                      title="Xóa bài viết này?"
                      onConfirm={() => deletePost(record.id)}
                      okText="Có"
                      cancelText="Không"
                    >
                      <Button type="link" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </>
                ),
              },
            ]}
            size="small"
          />

          {/* Add/Edit Modal */}
          <Modal
            title={editingPost ? 'Cập nhật bài viết' : 'Thêm bài viết mới'}
            visible={isModalVisible}
            onOk={() => form.submit()}
            onCancel={() => {
              setIsModalVisible(false);
              setEditingPost(null);
              form.resetFields();
            }}
            width={800}
          >
            <Form form={form} onFinish={addPost} layout="vertical">
              <Form.Item
                name="title"
                label="Tiêu đề"
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item name="slug" label="Slug">
                <Input />
              </Form.Item>

              <Form.Item
                name="thumbnail"
                label="Ảnh đại diện (URL)"
                rules={[{ required: true, message: 'Vui lòng nhập URL ảnh' }]}
              >
                <Input type="url" />
              </Form.Item>

              <Form.Item
                name="content"
                label="Nội dung (Markdown)"
                rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
              >
                <TextArea rows={8} />
              </Form.Item>

              <Form.Item name="tags" label="Thẻ">
                <Select
                  mode="multiple"
                  placeholder="Chọn hoặc tạo thẻ mới"
                  optionLabelProp="label"
                >
                  {tags.map((t) => (
                    <Option key={t.id} value={t.name} label={t.name}>
                      {t.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select>
                  <Option value="draft">Nháp</Option>
                  <Option value="published">Đã đăng</Option>
                </Select>
              </Form.Item>
            </Form>
          </Modal>
        </TabPane>

        {/* ================= TAG MANAGEMENT ================= */}
        <TabPane tab="Quản lý thẻ" key="5">
          <div style={{ marginBottom: 20 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingTag(null);
                tagForm.resetFields();
                setIsTagModalVisible(true);
              }}
            >
              Thêm thẻ mới
            </Button>
          </div>

          <Table
            dataSource={tags}
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: 'Tên thẻ',
                dataIndex: 'name',
                width: 200,
              },
              {
                title: 'Số bài viết',
                render: (_, record) => (
                  <Statistic
                    value={getTagUsageCount(record.name)}
                    suffix="bài"
                  />
                ),
              },
              {
                title: 'Hành động',
                render: (_, record) => (
                  <>
                    <Button
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditingTag(record);
                        tagForm.setFieldsValue(record);
                        setIsTagModalVisible(true);
                      }}
                    />
                    <Popconfirm
                      title={`Xóa thẻ "${record.name}"?`}
                      onConfirm={() => deleteTag(record.id)}
                      okText="Có"
                      cancelText="Không"
                    >
                      <Button type="link" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </>
                ),
              },
            ]}
            size="small"
          />

          {tags.length === 0 && <Empty description="Chưa có thẻ nào" />}

          {/* Tag Modal */}
          <Modal
            title={editingTag ? 'Cập nhật thẻ' : 'Thêm thẻ mới'}
            visible={isTagModalVisible}
            onOk={() => tagForm.submit()}
            onCancel={() => {
              setIsTagModalVisible(false);
              setEditingTag(null);
              tagForm.resetFields();
            }}
          >
            <Form form={tagForm} onFinish={addTag} layout="vertical">
              <Form.Item
                name="name"
                label="Tên thẻ"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên thẻ' },
                ]}
              >
                <Input placeholder="Nhập tên thẻ" />
              </Form.Item>
            </Form>
          </Modal>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default BlogApp;
