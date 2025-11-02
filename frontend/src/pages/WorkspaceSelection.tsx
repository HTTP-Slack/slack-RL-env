// Mirror link: https://slack.com/intl/en-in/
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { WorkspaceItem } from '../components/WorkspaceItem';
import { getWorkspaces, getUserEmail } from '../services/workspaceApi';
import type { Workspace } from '../types/workspace';

const WorkspaceSelection: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [showMore, setShowMore] = useState<boolean>(false);
  const location = useLocation();

  // Function to load workspaces
  const loadData = async () => {
    setLoading(true);
    try {
      const [workspacesData, email] = await Promise.all([
        getWorkspaces(),
        getUserEmail(),
      ]);
      setWorkspaces(workspacesData);
      setUserEmail(email);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and whenever user navigates to this page
  useEffect(() => {
    loadData();
  }, [location.pathname]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-[rgb(74,21,75)]">Loading...</div>;
  }

  const visibleWorkspaces = showMore ? workspaces : workspaces.slice(0, 1);
  const hasMoreWorkspaces = workspaces.length > 1;

  return (
    <div className="min-h-screen bg-[rgb(74,21,75)]">
      <Header />
      <section className="relative pt-28 pb-40">
      <div className="max-w-[1006px] mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-baseline mb-6">
          <h1 className="relative text-white text-[50px] font-bold leading-[56px] tracking-[-0.6px]">
            <picture className="inline-block">
              <img
                src="https://a.slack-edge.com/70d4c04/marketing/img/homepage/signed-in-users/waving-hand.png"
                srcSet="https://a.slack-edge.com/70d4c04/marketing/img/homepage/signed-in-users/waving-hand.png 1x, https://a.slack-edge.com/70d4c04/marketing/img/homepage/signed-in-users/waving-hand@2x.png 2x"
                alt=""
                height="56"
                width="52"
                className="inline-block relative top-[6px] mr-1"
              />
            </picture>
            <span>Welcome back</span>
          </h1>
        </div>

        {/* Workspaces Section */}
        <div className="mb-12">
          {/* Title Bar */}
          <div className="flex items-center min-h-[82px] p-4 rounded-t-xl bg-[rgb(249,240,255)]">
            <span className="text-[18px]">Workspaces for {userEmail}</span>
          </div>

          {/* Workspaces List */}
          <div className="flex flex-col rounded-b-xl bg-white">
            {visibleWorkspaces.map((workspace, index) => (
              <div key={workspace._id} className="p-4 transition-all duration-125">
                <WorkspaceItem workspace={workspace} />
                {index < visibleWorkspaces.length - 1 && (
                  <div className="h-0 my-4 border-t border-[rgb(235,234,235)]"></div>
                )}
              </div>
            ))}

            {/* Placeholder workspaces when show more is false */}
            {!showMore && hasMoreWorkspaces && (
              <>
                <div className="h-0 my-4 border-t border-[rgb(235,234,235)]"></div>
                <div className="p-4 transition-all duration-125">
                  <div className="flex items-center">
                    <div className="w-[75px] h-[75px] mr-4 rounded-[5px] bg-[rgb(235,234,235)]"></div>
                    <div className="flex flex-col my-3 flex-1">
                      <div className="w-[180px] h-[23px] mb-2 rounded-[25px] bg-[rgb(235,234,235)]"></div>
                      <div className="flex flex-row items-center h-5">
                        <div className="flex flex-row items-center">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className="relative inline-block w-5 h-5 border border-white rounded-[4px] bg-[rgb(235,234,235)]"
                              style={{
                                marginLeft: i > 0 ? '-4px' : '0',
                                marginRight: i === 4 ? '10px' : '0',
                                zIndex: 5 - i,
                              }}
                            ></div>
                          ))}
                        </div>
                        <div className="w-[74.57px] h-5 bg-[rgb(235,234,235)]"></div>
                      </div>
                    </div>
                    <div className="ml-auto p-4 rounded-[4px] bg-[rgb(235,234,235)] border border-[rgb(235,234,235)] cursor-not-allowed">
                      <span className="text-[14px] font-bold leading-[18px] text-center uppercase tracking-[0.798px] whitespace-nowrap text-[rgb(105,105,105)]">
                        Launch Slack
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Show More/Less Button */}
          {hasMoreWorkspaces && (
            <div className="flex justify-center items-center mt-6">
              <button
                onClick={() => setShowMore(!showMore)}
                className="flex items-center px-4 py-2 rounded-[4px] text-[14px] text-center text-[rgb(18,100,163)] cursor-pointer"
              >
                <span className={showMore ? 'hidden' : ''}>See more</span>
                <span className={showMore ? '' : 'hidden'}>See less</span>
                <span
                  className="inline-block w-[10px] h-[10px] ml-2"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI1IiB2aWV3Qm94PSIwIDAgOCA1IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik03IDFMNCA0TDEgMSIgc3Ryb2tlPSIjMTI2NGEzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: '0% 50%',
                    backgroundSize: '8px 5px',
                    transform: showMore ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.1s cubic-bezier(0.165, 0.84, 0.44, 1)',
                  }}
                ></span>
              </button>
            </div>
          )}
        </div>

        {/* Create New Workspace Section */}
        <div className="mb-12">
          <div className="grid grid-cols-[200px_1fr_auto] items-center gap-0 p-4 rounded-xl bg-white">
            <img
              className="w-[200px] h-[120.5px] rounded-[5px] overflow-clip"
              src="https://a.slack-edge.com/0eacde0/marketing/img/homepage/signed-in-users/create-new-workspace-module/woman-with-laptop-color-background-new.png"
              srcSet="https://a.slack-edge.com/0eacde0/marketing/img/homepage/signed-in-users/create-new-workspace-module/woman-with-laptop-color-background-new.png 1x, https://a.slack-edge.com/0eacde0/marketing/img/homepage/signed-in-users/create-new-workspace-module/woman-with-laptop-color-background-new@2x.png 2x"
              alt=""
            />
            <p className="pr-4 text-[18px] leading-[27.99px] tracking-[-0.0216px] text-black">
              <strong>Want to use Slack with a different team?</strong>
            </p>
            <a
              href="/profile-step1"
              className="p-4 rounded-[4px] text-[14px] font-bold leading-[18px] text-center uppercase tracking-[0.798px] whitespace-nowrap text-[rgb(97,31,105)] bg-white border border-[rgb(97,31,105)] cursor-pointer transition-[box-shadow_0.42s_cubic-bezier(0.165,0.84,0.44,1),color_0.42s_cubic-bezier(0.165,0.84,0.44,1),background_0.42s_cubic-bezier(0.165,0.84,0.44,1)] hover:bg-[rgb(97,31,105)] hover:text-white"
            >
              Create a new workspace
            </a>
          </div>
        </div>

        {/* Not Seeing Your Workspace */}
        <div className="flex justify-center items-center mb-12 text-white">
          <p className="mb-0 mr-2 text-[18px] leading-[27.99px] tracking-[-0.0216px] text-white">
            Not seeing your workspace?
          </p>
          <a
            href="/signin"
            className="text-[18px] leading-[27.99px] tracking-[0.216px] text-[rgb(54,197,240)] cursor-pointer"
          >
            Try using a different email address
            <span
              className="inline-block w-[19px] h-[13px] ml-2"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M1%206a.5.5%200%200%200%200%201V6zM12.854.646a.5.5%200%200%200-.708.708l.708-.708zM18%206.5l.354.354a.5.5%200%200%200%200-.708L18%206.5zm-5.854%205.146a.5.5%200%200%200%20.708.708l-.708-.708zM1%207h16.5V6H1v1zm16.646-.854l-5.5%205.5.708.708%205.5-5.5-.708-.708zm-5.5-4.792l2.75%202.75.708-.708-2.75-2.75-.708.708zm2.75%202.75l2.75%202.75.708-.708-2.75-2.75-.708.708z%22%20fill%3D%22%2336c5f0%22%2F%3E%3C%2Fsvg%3E")`,
              }}
            ></span>
          </a>
        </div>

        {/* Download Module */}
        <div className="flex flex-row p-4 mb-20 border border-[rgb(249,240,255)] rounded-xl bg-[rgba(255,255,255,0.1)]">
          <svg
            fill="none"
            height="68"
            width="78"
            className="mr-4"
            viewBox="0 0 80 68"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Download Slack</title>
            <g>
              <path
                d="M73.719 31.718c-4.156-3.09-11.528-4.063-18.488-2.81a12.033 12.033 0 0 0-1.39-1.216c-6.995-5.2-19.11-7.013-30.2-3.803-7.634 2.209-13.128 14.538-10.104 14.773-8.28-.646-15.576 8.006-11.252 13.88 1.128 1.534 3.626 1.893 5.98 2.276-3.193 2.754-3.3 5.971-.2 8.616 6.314 5.384 19.063 5.601 25.52 2.753L67.48 46.565c4.253-2.94 5.826-5.359 5.585-8.695-.127-1.744 2.564-4.732.654-6.152z"
                fill="#000"
              />
              <path
                d="M62.438 12.924c.073-.741.119-1.473.117-2.193-.005-1.688-.222-3.193-.616-4.511l5.219-1.163L58.076.983a7.272 7.272 0 0 0-1.21-.543l-.03-.014.001.005C54.24-.46 50.95.008 47.372 2.076c-6.145 3.55-11.408 10.817-13.764 18.233-1.219.026-2.579.42-4.021 1.254-5.109 2.952-9.24 10.107-9.222 15.982.007 2.098.549 3.74 1.467 4.861-3.422 3.54-5.836 8.773-5.823 13.266.01 3.242 1.28 5.415 3.274 6.217l-.002.001 9.49 4.297L32 57.089l25.795-14.903c6.64-3.835 12.003-13.134 11.982-20.768-.017-5.71-3.039-8.867-7.34-8.494z"
                fill="#2f8ab7"
              />
              <path
                d="M57.056 6.453c-6.145 3.55-11.409 10.815-13.764 18.233-1.219.026-2.58.42-4.021 1.254-5.11 2.952-9.24 10.107-9.222 15.982.006 2.099.548 3.74 1.467 4.862-3.422 3.538-5.837 8.772-5.824 13.266.017 5.874 4.171 8.246 9.281 5.294l32.507-18.78C74.12 42.73 79.483 33.43 79.46 25.798c-.016-5.708-3.038-8.867-7.339-8.494.072-.742.118-1.473.117-2.193-.028-9.61-6.824-13.485-15.183-8.657z"
                fill="#f3ede4"
              />
              <g fill="#1264a3">
                <path d="m55.012 39.964-.013.008-.013.008c.005-.001.008-.005.013-.008l.013-.008zm.296-.283-.002.004.002-.004zm.011-.016-.005.006c.002-.001.004-.003.005-.006zm.01-.015-.008.011.008-.011zm4.875-9.934c.137-.08.275-.099.38-.04.208.12.21.51.002.87l-5.21 9.028a1.125 1.125 0 0 0 .156-.528l-.004-1.485 4.297-7.448c.105-.18.241-.319.38-.397zm-10.723 5.882c.136-.079.274-.098.38-.04l4.597 2.623.005 1.484c0 .166.06.284.153.34l-5.508-3.141c-.208-.12-.21-.51-.001-.87.101-.179.238-.317.374-.396z" />
                <path d="M54.946 21.565c.296-.171.537-.035.537.305l.045 15.692.005 1.486c0 .198-.08.418-.204.604l-.008.011-.003.005-.005.007-.007.01c0 .001-.002.001-.002.003a1.046 1.046 0 0 1-.292.28l-.013.007-.013.009c-.145.08-.276.085-.371.028-.094-.056-.152-.175-.153-.34l-.005-1.485-.045-15.694c0-.345.24-.759.534-.928zM48.036 47.212l12.541-7.245c.296-.17.773-.17 1.067 0 .294.171.292.447-.004.618L49.1 47.83c-.296.171-.772.171-1.066 0-.295-.17-.293-.447.003-.618z" />
              </g>
            </g>
          </svg>
          <div className="flex flex-col flex-1 relative">
            <span className="block mb-2 text-[18px] font-bold text-white">
              Slack for Mac
            </span>
            <div className="flex flex-row justify-between items-start">
              <span className="block text-[18px] text-white">
                Launch Slack from your dock and stay up to date with desktop notifications.
              </span>
              <a
                href="/downloads/mac"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-row justify-end items-center px-4 text-[18px] text-[rgb(54,197,240)] cursor-pointer"
              >
                <span className="block border-b border-[rgb(54,197,240)] text-[18px] font-bold text-[rgb(54,197,240)] cursor-pointer">
                  Download
                </span>
                <img
                  className="w-[13px] h-[17px] ml-1"
                  src="https://a.slack-edge.com/8a4d54e/marketing/img/icons/icon_workspace_arrow_blue_nav.svg"
                  alt="Arrow icon for download banner"
                />
              </a>
            </div>
            <button
              aria-label="Hide banner"
              className="absolute top-0 right-0 w-4 h-[23px] rounded-[4px] text-center text-white cursor-pointer"
            >
              <svg aria-hidden="true" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="-255 347 100 100">
                <title>Hide banner</title>
                <path d="M-160.4 434.2l-37.2-37.2 37.1-37.1-7-7-37.1 37.1-37.1-37.1-7 7 37.1 37.1-37.2 37.2 7.1 7 37.1-37.2 37.2 37.2" fill="white" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      </section>
    </div>
  );
};

export default WorkspaceSelection;
